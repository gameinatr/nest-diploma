import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    description: 'Order status (Admin only)',
    enum: OrderStatus,
    example: OrderStatus.SHIPPED
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Shipping address for the order',
    example: '456 Oak Ave, City, State 67890'
  })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the order',
    example: 'Updated delivery instructions'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}