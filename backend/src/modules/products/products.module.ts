import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { Product } from "./entities/product.entity";
import { Category } from "../categories/entities/category.entity";
import { SimpleCacheModule } from "../simple-cache/simple-cache.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category]),
    SimpleCacheModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
