import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { OrderStatus } from './enums/order-status.enum';
import { convertOrderAmounts, convertOrderItemPrices, convertProductPrices } from '../../common/utils/number-converter.util';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private cartService: CartService,
  ) {}

  async create(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
    // Get user's cart
    const cartData = await this.cartService.getCart(userId);
    
    if (!cartData.cart.items || cartData.cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Create order
    const order = this.orderRepository.create({
      userId,
      totalAmount: cartData.totalPrice,
      totalItems: cartData.totalItems,
      shippingAddress: createOrderDto.shippingAddress,
      notes: createOrderDto.notes,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items from cart items
    const orderItems = cartData.cart.items.map(cartItem => 
      this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: cartItem.product.id,
        quantity: cartItem.quantity,
        price: Number(cartItem.product.price),
        productTitle: cartItem.product.title,
      })
    );

    await this.orderItemRepository.save(orderItems);

    // Clear the cart
    await this.cartService.clearCart(userId);

    // Return order with items
    return this.findOne(savedOrder.id, userId);
  }

  async findAll(userId: number, queryDto: QueryOrderDto): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      status,
      page = 1,
      limit = 10,
    } = queryDto;

    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('order.userId = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    // Apply sorting (newest first)
    queryBuilder.orderBy('order.createdAt', 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    // Convert decimal strings to numbers
    const convertedOrders = orders.map(order => ({
      ...convertOrderAmounts(order),
      items: order.items.map(item => ({
        ...convertOrderItemPrices(item),
        product: item.product ? convertProductPrices(item.product) : item.product,
      })),
    }));

    return {
      orders: convertedOrders,
      total,
      page,
      limit,
    };
  }

  async findAllForAdmin(queryDto: QueryOrderDto): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      status,
      page = 1,
      limit = 10,
    } = queryDto;

    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product');

    if (status) {
      queryBuilder.where('order.status = :status', { status });
    }

    // Apply sorting (newest first)
    queryBuilder.orderBy('order.createdAt', 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    // Convert decimal strings to numbers
    const convertedOrders = orders.map(order => ({
      ...convertOrderAmounts(order),
      items: order.items.map(item => ({
        ...convertOrderItemPrices(item),
        product: item.product ? convertProductPrices(item.product) : item.product,
      })),
    }));

    return {
      orders: convertedOrders,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number, userId?: number): Promise<Order> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.id = :id', { id });

    if (userId) {
      queryBuilder.andWhere('order.userId = :userId', { userId });
    }

    const order = await queryBuilder.getOne();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Convert decimal strings to numbers
    const convertedOrder = {
      ...convertOrderAmounts(order),
      items: order.items.map(item => ({
        ...convertOrderItemPrices(item),
        product: item.product ? convertProductPrices(item.product) : item.product,
      })),
    };

    return convertedOrder;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto, userId?: number): Promise<Order> {
    const order = await this.findOne(id, userId);
    
    // Validate status transitions
    if (updateOrderDto.status && !this.isValidStatusTransition(order.status, updateOrderDto.status)) {
      throw new BadRequestException(`Cannot change status from ${order.status} to ${updateOrderDto.status}`);
    }

    Object.assign(order, updateOrderDto);
    await this.orderRepository.save(order);

    return this.findOne(id, userId);
  }

  async remove(id: number, userId?: number): Promise<void> {
    const order = await this.findOne(id, userId);
    
    // Only allow deletion of pending or cancelled orders
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CANCELLED) {
      throw new BadRequestException('Can only delete pending or cancelled orders');
    }

    await this.orderRepository.remove(order);
  }

  private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [], // No transitions from shipped
      [OrderStatus.CANCELLED]: [], // No transitions from cancelled
    };

    return validTransitions[currentStatus].includes(newStatus);
  }
}