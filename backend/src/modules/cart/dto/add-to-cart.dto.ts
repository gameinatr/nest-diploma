import { IsNumber, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({
    description: 'Product ID to add to cart',
    example: 1,
    type: Number
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  productId: number;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 2,
    type: Number,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}