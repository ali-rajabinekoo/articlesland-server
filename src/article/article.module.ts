import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), CategoryModule],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}
