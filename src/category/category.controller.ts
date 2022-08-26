import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiTags } from '@nestjs/swagger';
import { Category } from './category.entity';

@Controller('category')
@ApiTags('category')
@UseInterceptors(ClassSerializerInterceptor)
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  async categoryList(): Promise<Category[]> {
    return this.categoryService.getAllCategories();
  }
}
