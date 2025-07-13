import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentId?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}