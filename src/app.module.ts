import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./modules/database/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ProductsModule } from "./modules/products/products.module";
import { CartModule } from "./modules/cart/cart.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { User } from "./modules/auth/entities/user.entity";
import { Product } from "./modules/products/entities/product.entity";
import { Cart } from "./modules/cart/entities/cart.entity";
import { CartItem } from "./modules/cart/entities/cart-item.entity";
import { Category } from "./modules/categories/entities/category.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRESQL_ADDON_HOST,
      port: parseInt(process.env.POSTGRESQL_ADDON_PORT, 10),
      username: process.env.POSTGRESQL_ADDON_USER,
      password: process.env.POSTGRESQL_ADDON_PASSWORD,
      database: process.env.POSTGRESQL_ADDON_DB,
      entities: [User, Product, Cart, CartItem, Category],
      synchronize: true, // Set to false in production
      ssl: {
        rejectUnauthorized: false, // For cloud databases
      },
    }),
    DatabaseModule,
    AuthModule,
    ProductsModule,
    CartModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
