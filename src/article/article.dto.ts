import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';
import { validationMessages } from '../libs/messages';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ApiProperty } from '@nestjs/swagger';

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
