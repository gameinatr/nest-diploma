import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cart')
@ApiBearerAuth('JWT-auth')
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cart retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        userId: { type: 'number' },
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
                  image: { type: 'string', nullable: true },
                  price: { type: 'number', format: 'decimal' },
                  stock: { type: 'number' }
                }
              }
            }
          }
        },
        totalItems: { type: 'number' },
        totalPrice: { type: 'number', format: 'decimal' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Item added to cart successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        productId: { type: 'number' },
        quantity: { type: 'number' },
        price: { type: 'number', format: 'decimal' },
        cartId: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data or product not available' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'id', type: Number, description: 'Cart item ID' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Cart item updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        productId: { type: 'number' },
        quantity: { type: 'number' },
        price: { type: 'number', format: 'decimal' },
        cartId: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Cart item not found' })
  updateCartItem(
    @Request() req,
    @Param('id', ParseIntPipe) itemId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(req.user.id, itemId, updateCartItemDto);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', type: Number, description: 'Cart item ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Item removed from cart successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Item removed from cart' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Cart item not found' })
  removeFromCart(
    @Request() req,
    @Param('id', ParseIntPipe) itemId: number,
  ) {
    return this.cartService.removeFromCart(req.user.id, itemId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cart cleared successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Cart cleared' }
      }
    }
  })
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }
}