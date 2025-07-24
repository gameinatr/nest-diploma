import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiPropertyOptional({
    description: 'Shipping address for the order',
    example: '123 Main St, City, State 12345'
  })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the order',
    example: 'Please deliver after 5 PM'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}