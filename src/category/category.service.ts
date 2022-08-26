import { Injectable } from '@nestjs/common';
import { Category } from './category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { categoryList } from './category.list';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {
  }

  async preInsertCategories(): Promise<void> {
    for (const category of categoryList) {
      const duplicatedCategory: Category =
        await this.categoryRepository.findOneBy({
          title: category.title,
        });

      if (!duplicatedCategory) {
        const newCategory: Category = await this.categoryRepository.create(
          category,
        );
        await this.categoryRepository.save(newCategory);
      }
    }
  }

  async getArticleById(id: number): Promise<Category> {
    return this.categoryRepository.findOneBy({ id });
  }
}
