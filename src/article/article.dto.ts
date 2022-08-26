import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';
import { validationMessages } from '../libs/messages';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export class ArticleDto {
  @IsNotEmpty({ message: validationMessages.empty.articleTitle })
  title: string;

  @IsNotEmpty({ message: validationMessages.empty.articleBody })
  body: string;

  @IsNumberString({}, { message: validationMessages.empty.categoryId })
  categoryId: number;
}

export class EditArticleDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsString()
  categoryId: number;
}

export const NewArticleSchema: SchemaObject | ReferenceObject = {
  type: 'object',
  properties: {
    image: {
      type: 'string',
      format: 'binary',
    },
    title: {
      type: 'string',
      default: 'برنامه نویسی جاوااسکریپت',
      description: 'Article title',
    },
    body: {
      type: 'string',
      default: '<p>برنامه نویسی جاوااسکریپت</p>',
      description: 'Article body',
    },
    categoryId: {
      type: 'number',
      default: 1,
      description: 'Article category id. Positive integer',
    },
  },
};
