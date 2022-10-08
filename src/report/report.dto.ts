import { Article } from '../article/article.entity';
import { Comment } from '../comment/comment.entity';
import { User } from '../user/user.entity';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { validationMessages } from '../libs/messages';
import { ApiProperty } from '@nestjs/swagger';

export class NewReportDto {
  type: 'spam' | 'immoral' | 'abusive' | 'illegal' | 'aggressive' | 'other';
  content?: string;
  article?: Article;
  comment?: Comment;
  owner: User;
}

export class NewReportBodyDto {
  @ApiProperty({ default: 'spam', description: 'Report type' })
  @IsNotEmpty({ message: validationMessages.empty.reportType })
  type: 'spam' | 'immoral' | 'abusive' | 'illegal' | 'aggressive' | 'other';

  @ApiProperty({
    default: '',
    required: false,
    description: 'Report content (It\'s required when type is "other")',
  })
  @IsOptional()
  @MinLength(30, { message: validationMessages.length.reportContentShort })
  @MaxLength(200, { message: validationMessages.length.reportContentLong })
  @IsString()
  content?: string;

  @ApiProperty({ default: '1', description: 'ArticleId', required: false })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  articleId?: number;

  @ApiProperty({ description: 'CommentId', required: false })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  commentId?: number;
}
