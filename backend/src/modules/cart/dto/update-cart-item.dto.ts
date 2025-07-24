import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'New quantity for the cart item',
    example: 3,
    type: Number,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}