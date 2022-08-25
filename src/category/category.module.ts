import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { CategoryService } from './category.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [CategoryService],
})
export class CategoryModule {
  constructor(private categoryService: CategoryService) {
    categoryService.preInsertCategories().catch((e) => {
      console.log('Failed to add categories: ');
      console.log(e);
      process.exit(1);
    });
  }
}
