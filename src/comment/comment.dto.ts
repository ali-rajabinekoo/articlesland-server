import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { validationMessages } from '../libs/messages';

export class NewCommentDto {
  @ApiProperty({
    default: 'خیلی عالی بود',
    maxLength: 500,
    minLength: 10,
    description: 'Add new comment for article',
  })
  @MinLength(10, { message: validationMessages.length.commentBodyShort })
  @MaxLength(500, { message: validationMessages.length.commentBodyLong })
  @IsNotEmpty({ message: validationMessages.empty.commentBody })
  body: string;

  @ApiProperty({
    default: null,
    description: 'Parent Comment This is for comments that have been replied',
  })
  @Min(1)
  @IsOptional()
  parentId: number;
}

export const commentSchemaApiDocument = {
  id: 1,
  body: 'خیلی عالی ۲',
  parent: [],
  children: [],
  owner: {
    id: 1,
    username: 'articlesLandUser',
    phoneNumber: '9212210982',
    email: 'articlesLandUser@email.com',
    avatar: '/avatar/something.png',
    bio: 'This is ArticlesLand user',
    created_at: new Date(),
    updated_at: new Date(),
  },
  created_at: new Date(),
};
