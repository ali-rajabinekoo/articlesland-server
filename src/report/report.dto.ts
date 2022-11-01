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
import { ArticleResDto } from '../article/article.dto';
import { UserResDto } from '../user/user.dto';
import { CommentResDto } from '../comment/comment.dto';
import { Report } from './report.entity';

type ReportType =
  | 'spam'
  | 'immoral'
  | 'abusive'
  | 'illegal'
  | 'aggressive'
  | 'other';

export const ReportTypeArray = [
  'spam',
  'immoral',
  'abusive',
  'illegal',
  'aggressive',
  'other',
];

export const ReportContentTypeArray = ['comment', 'post'];

export class NewReportDto {
  type: ReportType;
  content?: string;
  article?: Article;
  comment?: Comment;
  owner: User;
}

export class NewReportBodyDto {
  @ApiProperty({ default: 'spam', description: 'Report type' })
  @IsNotEmpty({ message: validationMessages.empty.reportType })
  type: ReportType;

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

// Response Serialization DTOs

export class ReportResDto {
  owner: UserResDto;
  comment?: CommentResDto | undefined;
  article?: ArticleResDto | undefined;

  constructor(partial: Partial<Report>) {
    if (!!partial?.owner) {
      this.owner = new UserResDto(partial?.owner, { protectedUser: true });
    }
    if (!!partial?.comment) {
      this.comment = new CommentResDto(partial?.comment);
    }
    if (!!partial?.article) {
      this.article = new ArticleResDto(partial?.article);
    }
    Object.assign(this, partial);
  }
}
