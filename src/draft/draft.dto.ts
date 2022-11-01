import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { validationMessages } from '../libs/messages';

export class DraftDto {
  articleId: number;
  userId: number;
  title: string;
  body: string;
}

export class DraftReqDto {
  @ApiProperty({
    default: 'برنامه نویسی جاوااسکریپت',
    description: 'Article title',
  })
  @IsOptional({ message: validationMessages.empty.articleTitle })
  title: string;

  @ApiProperty({
    default: '<p>برنامه نویسی جاوااسکریپت</p>',
    description: 'Article body',
  })
  @IsNotEmpty({ message: validationMessages.empty.articleBody })
  body: string;
}
