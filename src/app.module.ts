import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { Utils } from './libs/utils';
import { Request } from './libs/request';
import { TypeOrmModule } from '@nestjs/typeorm';
import { database } from './libs/config';
import { UserModule } from './user/user.module';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';
import { User } from './user/user.entity';
import { Category } from './category/category.entity';
import { Article } from './article/article.entity';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { Comment } from './comment/comment.entity';
import { BookmarkModule } from './bookmark/bookmark.module';
import { ReportModule } from './report/report.module';
import { Like } from './like/like.entity';
import { Bookmark } from './bookmark/bookmark.entity';
import { Report } from './report/report.entity';
import { FollowModule } from './follow/follow.module';
import { Follow } from './follow/follow.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: database.host,
      port: database.port,
      username: database.username,
      password: database.password,
      database: database.dbname,
      entities: [
        User,
        Category,
        Article,
        Comment,
        Like,
        Bookmark,
        Report,
        Follow,
      ],
      synchronize: true,
    }),
    UserModule,
    ArticleModule,
    CategoryModule,
    CommentModule,
    LikeModule,
    BookmarkModule,
    ReportModule,
    FollowModule,
  ],
  providers: [Utils, Request],
})
export class AppModule {}
