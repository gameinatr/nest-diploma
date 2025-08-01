import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { parentId, ...categoryData } = createCategoryDto;

    // Validate parent category exists if parentId is provided
    if (parentId) {
      const parentCategory = await this.categoryRepository.findOne({ where: { id: parentId } });
      if (!parentCategory) {
        throw new NotFoundException(`Parent category with ID ${parentId} not found`);
      }
    }

    const category = this.categoryRepository.create(categoryData);
    if (parentId) {
      category.parentId = parentId;
    }

    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      relations: ['parent', 'children'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findRootCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parentId: null, isActive: true },
      relations: ['children'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findCategoryTree(): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      relations: ['children'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    // Build tree structure
    const categoryMap = new Map<number, Category>();
    const rootCategories: Category[] = [];

    // First pass: create map of all categories
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Second pass: build tree structure
    categories.forEach(category => {
      const categoryNode = categoryMap.get(category.id);
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryNode);
        }
      } else {
        rootCategories.push(categoryNode);
      }
    });

    return rootCategories;
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, isActive: true },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findByParent(parentId: number): Promise<Category[]> {
    const parentCategory = await this.findOne(parentId);
    
    return this.categoryRepository.find({
      where: { parentId, isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    const { parentId, ...updateData } = updateCategoryDto;

    // Validate parent category exists if parentId is provided
    if (parentId !== undefined) {
      if (parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      if (parentId) {
        const parentCategory = await this.categoryRepository.findOne({ where: { id: parentId } });
        if (!parentCategory) {
          throw new NotFoundException(`Parent category with ID ${parentId} not found`);
        }

        // Check for circular reference
        if (await this.wouldCreateCircularReference(id, parentId)) {
          throw new BadRequestException('Cannot create circular reference in category hierarchy');
        }
      }

      category.parentId = parentId;
    }

    Object.assign(category, updateData);
    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if category has active children
    const activeChildrenCount = await this.categoryRepository.count({ 
      where: { parentId: id, isActive: true } 
    });
    if (activeChildrenCount > 0) {
      throw new BadRequestException('Cannot delete category that has active subcategories');
    }

    // Soft delete: set isActive to false instead of removing
    category.isActive = false;
    await this.categoryRepository.save(category);
    
    console.log(`✅ Category ${id} soft deleted successfully`);
  }

  private async wouldCreateCircularReference(categoryId: number, newParentId: number): Promise<boolean> {
    let currentParentId = newParentId;
    
    while (currentParentId) {
      if (currentParentId === categoryId) {
        return true;
      }
      
      const parent = await this.categoryRepository.findOne({ where: { id: currentParentId } });
      currentParentId = parent?.parentId;
    }
    
    return false;
  }
}