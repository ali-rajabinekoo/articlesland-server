import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Category } from './category.entity';

@Controller('category')
@ApiTags('category')
@UseInterceptors(ClassSerializerInterceptor)
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  @ApiOkResponse({
    description: 'Returns all categories',
    type: [Category],
  })
  async categoryList(): Promise<Category[]> {
    return this.categoryService.getAllCategories();
  }
}
