import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from 'cookie-parser';

import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });
  
  // Enable cookie parser
  app.use(cookieParser());
  
  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Enable global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
