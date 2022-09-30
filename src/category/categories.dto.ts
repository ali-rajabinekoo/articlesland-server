import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray } from 'class-validator';
import { validationMessages } from '../libs/messages';
import { ArticleResDto } from '../article/article.dto';
import { Category } from './category.entity';

export class SelectedCategoriesDto {
  @ApiProperty({
    default: ['1', '2', '3'],
    description: 'Pass categories id to set them for user',
  })
  @IsArray()
  @ArrayMinSize(1, { message: validationMessages.length.selectedCategories })
  list: number[];
}

// Response Serialization DTOs

export class CategoryResDto {
  articles: ArticleResDto[];

  constructor(partial: Partial<Category>) {
    if (Array.isArray(partial?.articles) && partial?.articles.length !== 0) {
      this.articles = partial.articles.map((el) => new ArticleResDto(el));
    }
    Object.assign(this, partial);
  }
}
