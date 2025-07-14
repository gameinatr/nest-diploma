import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { convertProductPrices } from '../../common/utils/number-converter.util';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId });
      cart = await this.cartRepository.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async getCart(userId: number): Promise<{
    cart: Cart;
    totalItems: number;
    totalPrice: number;
  }> {
    const cart = await this.getOrCreateCart(userId);
    
    // Convert price strings to numbers for calculations
    cart.items.forEach(item => {
      item.product = convertProductPrices(item.product);
    });
    
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );

    return {
      cart: {
        ...cart,
        totalAmount: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
      },
      totalItems,
      totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
    };
  }

  async addToCart(userId: number, addToCartDto: AddToCartDto): Promise<{
    cart: Cart;
    totalItems: number;
    totalPrice: number;
  }> {
    const { productId, quantity } = addToCartDto;

    // Check if product exists
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check if product is active
    if (!product.isActive) {
      throw new BadRequestException('Product is not available');
    }

    // Check stock availability
    if (product.stock < quantity) {
      throw new BadRequestException(`Insufficient stock. Available: ${product.stock}`);
    }

    const cart = await this.getOrCreateCart(userId);

    // Check if item already exists in cart
    let cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId },
      relations: ['product'],
    });

    if (cartItem) {
      // Update quantity if item exists
      const newQuantity = cartItem.quantity + quantity;
      
      // Check total stock availability
      if (product.stock < newQuantity) {
        throw new BadRequestException(`Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`);
      }
      
      cartItem.quantity = newQuantity;
      await this.cartItemRepository.save(cartItem);
    } else {
      // Create new cart item
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity,
      });
      await this.cartItemRepository.save(cartItem);
    }

    return this.getCart(userId);
  }

  async updateCartItem(userId: number, itemId: number, updateCartItemDto: UpdateCartItemDto): Promise<{
    cart: Cart;
    totalItems: number;
    totalPrice: number;
  }> {
    const { quantity } = updateCartItemDto;

    const cart = await this.getOrCreateCart(userId);
    
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      throw new BadRequestException(`Insufficient stock. Available: ${cartItem.product.stock}`);
    }

    cartItem.quantity = quantity;
    await this.cartItemRepository.save(cartItem);

    return this.getCart(userId);
  }

  async removeFromCart(userId: number, itemId: number): Promise<{
    cart: Cart;
    totalItems: number;
    totalPrice: number;
  }> {
    const cart = await this.getOrCreateCart(userId);
    
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);

    return this.getCart(userId);
  }

  async clearCart(userId: number): Promise<{
    cart: Cart;
    totalItems: number;
    totalPrice: number;
  }> {
    const cart = await this.getOrCreateCart(userId);
    
    await this.cartItemRepository.delete({ cartId: cart.id });

    return this.getCart(userId);
  }
}