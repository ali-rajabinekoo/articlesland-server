import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Category } from './category.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestFormat } from '../user/user.dto';
import { User } from '../user/user.entity';
import { exceptionMessages } from '../libs/messages';
import { UserService } from '../user/user.service';
import { SelectedCategoriesDto } from './categories.dto';

@Controller('category')
@ApiTags('category')
@UseInterceptors(ClassSerializerInterceptor)
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
export class CategoryController {
  constructor(
    private categoryService: CategoryService,
    private userService: UserService,
  ) {}

  @Get()
  @ApiOkResponse({
    description: 'Returns all categories',
    type: [Category],
  })
  async categoryList(): Promise<Category[]> {
    return this.categoryService.getAllCategories();
  }

  @Post()
  @ApiOkResponse({
    description: 'All categories already set for user',
    type: User,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async setCategoriesForUser(
    @Req() req: RequestFormat,
    @Body() body: SelectedCategoriesDto,
  ): Promise<User> {
    const categories: Category[] = await Promise.all(
      body.list.map(async (id) => {
        const category: Category = await this.categoryService.getCategoryById(
          id,
        );
        if (!category)
          throw new NotFoundException(exceptionMessages.notFound.category);
        return category;
      }),
    );
    const user: User = req.user;
    user.selectedCategories = categories;
    await this.userService.saveUser(user);
    return user;
  }
}
