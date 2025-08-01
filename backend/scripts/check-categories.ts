import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CategoriesService } from '../src/modules/categories/categories.service';

async function checkCategories() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const categoriesService = app.get(CategoriesService);

  try {
    console.log('📂 Checking categories and subcategories...\n');
    
    const categoryTree = await categoriesService.findCategoryTree();
    
    if (categoryTree.length === 0) {
      console.log('❌ No categories found in the database');
      await app.close();
      return;
    }

    console.log('📋 Category Tree:');
    categoryTree.forEach(category => {
      console.log(`\n🏷️  ${category.name} (ID: ${category.id})`);
      if (category.description) {
        console.log(`   Description: ${category.description}`);
      }
      
      if (category.children && category.children.length > 0) {
        console.log('   Subcategories:');
        category.children.forEach(subcategory => {
          console.log(`   └── ${subcategory.name} (ID: ${subcategory.id})`);
          if (subcategory.description) {
            console.log(`       Description: ${subcategory.description}`);
          }
        });
      } else {
        console.log('   └── No subcategories');
      }
    });
    
  } catch (error) {
    console.error('Error checking categories:', error.message);
  } finally {
    await app.close();
  }
}

checkCategories();