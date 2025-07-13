import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ProductsModule } from "./modules/products/products.module";
import { CartModule } from "./modules/cart/cart.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { User } from "./modules/auth/entities/user.entity";
import { Product } from "./modules/products/entities/product.entity";
import { Cart } from "./modules/cart/entities/cart.entity";
import { CartItem } from "./modules/cart/entities/cart-item.entity";
import { Category } from "./modules/categories/entities/category.entity";
import { Order } from "./modules/orders/entities/order.entity";
import { OrderItem } from "./modules/orders/entities/order-item.entity";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      url: 'postgresql://diploma_postgres_user:NTA5DzzxBSZoP48IaxlWuyaO2799xwMB@dpg-d1pra4s9c44c738u6ad0-a.frankfurt-postgres.render.com/diploma_postgres', //process.env.POSTGRESQL_URL,
      entities: [User, Product, Cart, CartItem, Category, Order, OrderItem],
      synchronize: true, // Set to false in production
      ssl: {
        rejectUnauthorized: false, // For cloud databases
      },
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CartModule,
    CategoriesModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  onModuleInit() {
    console.log("Application initialized");
  }
}
