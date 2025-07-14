import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./entities/product.entity";
import { Category } from "../categories/entities/category.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { QueryProductDto } from "./dto/query-product.dto";
import { convertProductPrices } from "../../common/utils/number-converter.util";
import { SimpleCacheService } from "../simple-cache/simple-cache.service";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private simpleCacheService: SimpleCacheService
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryId, subcategoryId, ...productData } = createProductDto;

    // Validate category exists
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Validate subcategory exists if provided
    if (subcategoryId) {
      const subcategory = await this.categoryRepository.findOne({
        where: { id: subcategoryId },
      });
      if (!subcategory) {
        throw new NotFoundException(
          `Subcategory with ID ${subcategoryId} not found`
        );
      }
    }

    const product = this.productRepository.create({
      ...productData,
      categoryId,
      subcategoryId,
    });

    return this.productRepository.save(product);
  }

  async findAll(queryDto: QueryProductDto): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      categoryId,
      subcategoryId,
      search,
      minPrice,
      maxPrice,
      isActive,
      sortBy = "createdAt",
      sortOrder = "DESC",
      page = 1,
      limit = 10,
    } = queryDto;

    const queryBuilder = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.subcategory", "subcategory");

    // Apply filters
    if (categoryId) {
      queryBuilder.andWhere("product.categoryId = :categoryId", { categoryId });
    }

    if (subcategoryId) {
      queryBuilder.andWhere("product.subcategoryId = :subcategoryId", {
        subcategoryId,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        "(product.title ILIKE :search OR product.description ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      queryBuilder.andWhere("product.price BETWEEN :minPrice AND :maxPrice", {
        minPrice,
        maxPrice,
      });
    } else if (minPrice !== undefined) {
      queryBuilder.andWhere("product.price >= :minPrice", { minPrice });
    } else if (maxPrice !== undefined) {
      queryBuilder.andWhere("product.price <= :maxPrice", { maxPrice });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere("product.isActive = :isActive", { isActive });
    }

    // Apply sorting
    queryBuilder.orderBy(`product.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    // Convert decimal strings to numbers
    const convertedProducts = products.map(convertProductPrices);

    return {
      products: convertedProducts,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Product> {
    // Try to get product from cache first
    const simpleCachedProduct = await this.simpleCacheService.get(id);
    if (simpleCachedProduct) {
      return simpleCachedProduct;
    }

    // If not in cache, fetch from database
    console.log(`💾 Fetching product ${id} from database`);
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["category", "subcategory"],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const convertedProduct = convertProductPrices(product);

    // Cache the product for future requests
    await this.simpleCacheService.set(id, convertedProduct);

    return convertedProduct;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto
  ): Promise<Product> {
    // Clear cache before updating
    await this.simpleCacheService.delete(id);
    console.log(`🔄 Updating product ${id} - cache cleared`);

    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["category", "subcategory"],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const { categoryId, subcategoryId, ...updateData } = updateProductDto;

    // Validate category exists if provided
    if (categoryId !== undefined) {
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }
      product.categoryId = categoryId;
    }

    // Validate subcategory exists if provided
    if (subcategoryId !== undefined) {
      if (subcategoryId) {
        const subcategory = await this.categoryRepository.findOne({
          where: { id: subcategoryId },
        });
        if (!subcategory) {
          throw new NotFoundException(
            `Subcategory with ID ${subcategoryId} not found`
          );
        }
      }
      product.subcategoryId = subcategoryId;
    }

    Object.assign(product, updateData);
    const updatedProduct = await this.productRepository.save(product);

    // Cache the updated product
    const convertedProduct = convertProductPrices(updatedProduct);
    await this.simpleCacheService.set(id, convertedProduct);

    return convertedProduct;
  }

  async remove(id: number): Promise<void> {
    // Clear cache before removing
    await this.simpleCacheService.delete(id);
    console.log(`🗑️ Removing product ${id} - cache cleared`);

    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["category", "subcategory"],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.productRepository.remove(product);
  }
}
