import { Injectable } from '@nestjs/common';
import { Category } from './category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, FindOptionsWhere } from 'typeorm';
import { categoryList } from './category.list';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

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

  async getCategoryById(id: number): Promise<Category> {
    return this.categoryRepository.findOneBy({ id });
  }

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({ relations: ['articles'] });
  }

  async getArticlesOfCategory(
    id: number,
    founded?: number[],
  ): Promise<Category> {
    let where: FindOptionsWhere<Category> = { id };
    if (!!founded) where = { ...where, articles: { id: Not(In(founded)) } };
    return this.categoryRepository.findOne({
      where,
      relations: ['articles', 'articles.category', 'articles.owner'],
    });
  }
}
