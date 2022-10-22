import { Module } from '@nestjs/common';
import { LinkController } from './link.controller';
import { LinkService } from './link.service';
import { ArticleModule } from '../article/article.module';

@Module({
  imports: [ArticleModule],
  controllers: [LinkController],
  providers: [LinkService],
})
export class LinkModule {}
