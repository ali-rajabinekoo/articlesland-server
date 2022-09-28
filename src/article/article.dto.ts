import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';
import { validationMessages } from '../libs/messages';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Article } from './article.entity';
import { UserResDto } from '../user/user.dto';
import { CommentResDto } from '../comment/comment.dto';

export class ArticleDto {
  @ApiProperty({
    default: 'برنامه نویسی جاوااسکریپت',
    description: 'Article title',
  })
  @IsNotEmpty({ message: validationMessages.empty.articleTitle })
  title: string;

  @ApiProperty({
    default: '<p>برنامه نویسی جاوااسکریپت</p>',
    description: 'Article body',
  })
  @IsNotEmpty({ message: validationMessages.empty.articleBody })
  body: string;
}

export class EditArticleDto {
  @ApiProperty({
    default: 'برنامه نویسی جاوااسکریپت',
    description: 'Article title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    default: '<p>برنامه نویسی جاوااسکریپت</p>',
    description: 'Article body',
  })
  @IsString()
  body: string;
}

export class PublishArticleDto {
  @IsNumberString({}, { message: validationMessages.empty.categoryId })
  @IsNotEmpty({ message: validationMessages.empty.categoryId })
  categoryId: number;
}

export class GetArticleResponse extends Article {
  body?: string | undefined;
}

export class ViewedArticleResponse extends Article {
  todayViews?: number | undefined;
}

export const PublishArticleSchema: SchemaObject | ReferenceObject = {
  type: 'object',
  properties: {
    image: {
      type: 'string',
      format: 'binary',
    },
    categoryId: {
      type: 'number',
      default: 1,
      description: 'Article category id. Positive integer',
    },
  },
};

// Response Serialization DTOs

export class ArticleResDto {
  owner: UserResDto;
  likes: UserResDto[];
  comments: CommentResDto[];

  constructor(
    partial: Partial<Article | GetArticleResponse | ViewedArticleResponse>,
  ) {
    if (!!partial?.owner) {
      this.owner = new UserResDto(partial.owner, {
        protectedUser: true,
      });
    }
    if (Array.isArray(partial?.likes) && partial?.likes.length !== 0) {
      this.likes = partial.likes.map(
        (el) =>
          new UserResDto(el, {
            protectedUser: true,
          }),
      );
    }
    if (Array.isArray(partial?.comments) && partial?.comments.length !== 0) {
      this.comments = partial.comments.map((el) => new CommentResDto(el));
    }
    Object.assign(this, partial);
  }
}
