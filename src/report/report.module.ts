import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { UserModule } from '../user/user.module';
import { CommentModule } from '../comment/comment.module';
import { ArticleModule } from '../article/article.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    UserModule,
    CommentModule,
    ArticleModule,
  ],
  providers: [ReportService],
  controllers: [ReportController],
})
export class ReportModule {}
