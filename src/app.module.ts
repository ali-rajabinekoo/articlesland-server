import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { database } from './libs/config';
import { UserModule } from './user/user.module';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';
import { User } from './user/user.entity';
import { Category } from './category/category.entity';
import { Article } from './article/article.entity';
import { CommentModule } from './comment/comment.module';
import { Comment } from './comment/comment.entity';
import { ReportModule } from './report/report.module';
import { Report } from './report/report.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DraftModule } from './draft/draft.module';
import { NotificationModule } from './notification/notification.module';
import { Notification } from './notification/notification.entity';
import { LinkModule } from './link/link.module';

export const AppModuleMetadata = {
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: database.host,
      port: database.port,
      username: database.username,
      password: database.password,
      database: database.dbname,
      entities: [User, Category, Article, Comment, Report, Notification],
      synchronize: true,
      timezone: 'Asia/Tehran',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/statics',
    }),
    AuthModule,
    UserModule,
    ArticleModule,
    CategoryModule,
    CommentModule,
    ReportModule,
    DraftModule,
    NotificationModule,
    LinkModule,
  ],
};

@Module(AppModuleMetadata)
export class AppModule {}
