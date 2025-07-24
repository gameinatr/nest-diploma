import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { QueryProductDto } from "./dto/query-product.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../auth/enums/role.enum";

@ApiTags('Products')
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Product successfully created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        title: { type: 'string' },
        image: { type: 'string', nullable: true },
        categoryId: { type: 'number' },
        subcategoryId: { type: 'number', nullable: true },
        price: { type: 'number', format: 'decimal' },
        description: { type: 'string' },
        stock: { type: 'number' },
        isActive: { type: 'boolean' },
        sku: { type: 'string', nullable: true },
        weight: { type: 'number', format: 'decimal', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin role required' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filtering, sorting and pagination' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number, description: 'Filter by category ID' })
  @ApiQuery({ name: 'subcategoryId', required: false, type: Number, description: 'Filter by subcategory ID' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in product title and description' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Minimum price filter' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Maximum price filter' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort by field (title, price, createdAt, etc.)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              title: { type: 'string' },
              image: { type: 'string', nullable: true },
              categoryId: { type: 'number' },
              subcategoryId: { type: 'number', nullable: true },
              price: { type: 'number', format: 'decimal' },
              description: { type: 'string' },
              stock: { type: 'number' },
              isActive: { type: 'boolean' },
              sku: { type: 'string', nullable: true },
              weight: { type: 'number', format: 'decimal', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              category: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' }
                }
              },
              subcategory: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' }
                }
              }
            }
          }
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' }
      }
    }
  })
  findAll(@Query() queryDto: QueryProductDto) {
    return this.productsService.findAll(queryDto);
  }

  @Get(":id")
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Product retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        title: { type: 'string' },
        image: { type: 'string', nullable: true },
        categoryId: { type: 'number' },
        subcategoryId: { type: 'number', nullable: true },
        price: { type: 'number', format: 'decimal' },
        description: { type: 'string' },
        stock: { type: 'number' },
        isActive: { type: 'boolean' },
        sku: { type: 'string', nullable: true },
        weight: { type: 'number', format: 'decimal', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        category: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' }
          }
        },
        subcategory: {
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'number' },
            name: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update product by ID (Admin only)' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Product updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        title: { type: 'string' },
        image: { type: 'string', nullable: true },
        categoryId: { type: 'number' },
        subcategoryId: { type: 'number', nullable: true },
        price: { type: 'number', format: 'decimal' },
        description: { type: 'string' },
        stock: { type: 'number' },
        isActive: { type: 'boolean' },
        sku: { type: 'string', nullable: true },
        weight: { type: 'number', format: 'decimal', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin role required' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete product by ID (Admin only)' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin role required' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
