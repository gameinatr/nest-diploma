import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create order from cart' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Order created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        userId: { type: 'number' },
        status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'cancelled'] },
        totalAmount: { type: 'number', format: 'decimal' },
        shippingAddress: { type: 'string', nullable: true },
        notes: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data or empty cart' })
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'paid', 'shipped', 'cancelled'], description: 'Filter by order status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiResponse({ 
    status: 200, 
    description: 'User orders retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              userId: { type: 'number' },
              status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'cancelled'] },
              totalAmount: { type: 'number', format: 'decimal' },
              shippingAddress: { type: 'string', nullable: true },
              notes: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' }
      }
    }
  })
  findUserOrders(@Request() req, @Query() queryDto: QueryOrderDto) {
    return this.ordersService.findAll(req.user.id, queryDto);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'paid', 'shipped', 'cancelled'], description: 'Filter by order status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiResponse({ 
    status: 200, 
    description: 'All orders retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              userId: { type: 'number' },
              status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'cancelled'] },
              totalAmount: { type: 'number', format: 'decimal' },
              shippingAddress: { type: 'string', nullable: true },
              notes: { type: 'string', nullable: true },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  email: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' }
                }
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' }
      }
    }
  })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin role required' })
  findAllOrders(@Query() queryDto: QueryOrderDto) {
    return this.ordersService.findAllForAdmin(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID (own orders only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        userId: { type: 'number' },
        status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'cancelled'] },
        totalAmount: { type: 'number', format: 'decimal' },
        shippingAddress: { type: 'string', nullable: true },
        notes: { type: 'string', nullable: true },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              productId: { type: 'number' },
              quantity: { type: 'number' },
              price: { type: 'number', format: 'decimal' },
              product: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  title: { type: 'string' },
                  image: { type: 'string', nullable: true }
                }
              }
            }
          }
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Order not found or access denied' })
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id, req.user.id);
  }

  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get order by ID (Admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        userId: { type: 'number' },
        status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'cancelled'] },
        totalAmount: { type: 'number', format: 'decimal' },
        shippingAddress: { type: 'string', nullable: true },
        notes: { type: 'string', nullable: true },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' }
          }
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              productId: { type: 'number' },
              quantity: { type: 'number' },
              price: { type: 'number', format: 'decimal' },
              product: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  title: { type: 'string' },
                  image: { type: 'string', nullable: true }
                }
              }
            }
          }
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin role required' })
  findOneForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order (shipping address and notes only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Order updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        userId: { type: 'number' },
        status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'cancelled'] },
        totalAmount: { type: 'number', format: 'decimal' },
        shippingAddress: { type: 'string', nullable: true },
        notes: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Order not found or access denied' })
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    // Users can only update shipping address and notes
    const { status, ...userUpdateData } = updateOrderDto;
    return this.ordersService.update(id, userUpdateData, req.user.id);
  }

  @Patch('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update order (Admin only - can update status)' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Order updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        userId: { type: 'number' },
        status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'cancelled'] },
        totalAmount: { type: 'number', format: 'decimal' },
        shippingAddress: { type: 'string', nullable: true },
        notes: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin role required' })
  updateForAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    // Admins can update all fields including status
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel/Delete order (own orders only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiResponse({ status: 204, description: 'Order deleted successfully' })
  @ApiNotFoundResponse({ description: 'Order not found or access denied' })
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id, req.user.id);
  }

  @Delete('admin/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete order (Admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiResponse({ status: 204, description: 'Order deleted successfully' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin role required' })
  removeForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}