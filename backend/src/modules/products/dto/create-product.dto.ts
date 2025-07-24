import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product title',
    example: 'Wireless Bluetooth Headphones'
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/images/headphones.jpg',
    format: 'url'
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  image?: string;

  @ApiProperty({
    description: 'Category ID',
    example: 1,
    type: Number
  })
  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @ApiPropertyOptional({
    description: 'Subcategory ID',
    example: 5,
    type: Number
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  subcategoryId?: number;

  @ApiProperty({
    description: 'Product price',
    example: 99.99,
    type: Number,
    minimum: 0
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({
    description: 'Product description',
    example: 'High-quality wireless Bluetooth headphones with noise cancellation'
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Stock quantity',
    example: 50,
    type: Number,
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @ApiPropertyOptional({
    description: 'Product active status',
    example: true,
    type: Boolean,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Stock Keeping Unit (SKU)',
    example: 'WBH-001'
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({
    description: 'Product weight in kg',
    example: 0.25,
    type: Number,
    minimum: 0
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  weight?: number;
}