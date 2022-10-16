import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReportService } from './report.service';
import {
  NewReportBodyDto,
  NewReportDto,
  ReportContentTypeArray,
  ReportResDto,
  ReportTypeArray,
} from './report.dto';
import { exceptionMessages, validationMessages } from '../libs/messages';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UnauthorizedDto } from '../auth/auth.dto';
import { RequestFormat } from '../user/user.dto';
import { User } from '../user/user.entity';
import { CommentService } from '../comment/comment.service';
import { ArticleService } from '../article/article.service';
import { Comment } from '../comment/comment.entity';
import { Article } from '../article/article.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Report } from './report.entity';
import { getReportsLimit } from '../libs/config';

@Controller('report')
@ApiTags('report')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiUnauthorizedResponse({ description: 'Unauthorized', type: UnauthorizedDto })
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
export class ReportController {
  constructor(
    private reportService: ReportService,
    private commentService: CommentService,
    private articleService: ArticleService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(new JwtAuthGuard('admin'))
  async reportList(
    @Query('page') page?: number | undefined,
    @Query('keyword') keyword?: string | undefined,
    @Query('reportType') reportType?: string | undefined,
    @Query('reportContentType') reportContentType?: string | undefined,
  ): Promise<{
    reports: ReportResDto[];
    total: number;
    totalPages: number;
  }> {
    if (!!reportType && !ReportTypeArray.includes(reportType)) {
      throw new BadRequestException(validationMessages.invalid.reportType);
    }
    if (
      !!reportContentType &&
      !ReportContentTypeArray.includes(reportContentType)
    ) {
      throw new BadRequestException(
        validationMessages.invalid.reportContentType,
      );
    }
    const [reports, total]: [Report[], number] =
      await this.reportService.getAllReport(
        keyword,
        page,
        reportType,
        reportContentType,
      );
    return {
      reports: reports.map((el) => new ReportResDto(el)),
      total,
      totalPages: Math.ceil(total / getReportsLimit),
    };
  }

  @Delete(':reportId')
  @ApiBearerAuth()
  @UseGuards(new JwtAuthGuard('admin'))
  async removeReport(
    @Query('keyword') keyword?: string | undefined,
    @Param('reportId') reportId?: number | undefined,
  ): Promise<void> {
    await this.reportService.findAndRemove(reportId);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async addNewReport(
    @Req() req: RequestFormat,
    @Body() body: NewReportBodyDto,
  ) {
    if (body.type === 'other' && !body.content) {
      throw new BadRequestException(exceptionMessages.badRequest.reportContent);
    }

    const query: NewReportDto = new NewReportDto();
    query.owner = req.user as User;
    query.content = body.content;
    query.type = body.type;

    if (!!body.commentId && !!body.articleId) {
      throw new BadRequestException(exceptionMessages.invalid.report);
    } else if (!!body.commentId) {
      const comment: Comment = await this.commentService.findCommentById(
        body.commentId,
      );
      if (!comment) {
        throw new NotFoundException(exceptionMessages.notFound.comment);
      }
      if (comment.owner.id === req.user.id) {
        throw new BadRequestException(exceptionMessages.invalid.report);
      }
      query.comment = comment;
    } else if (!!body.articleId) {
      const article: Article = await this.articleService.findArticleById(
        body.articleId,
      );
      if (!article) {
        throw new NotFoundException(exceptionMessages.notFound.article);
      }
      if (article.owner.id === req.user.id) {
        throw new BadRequestException(exceptionMessages.invalid.report);
      }
      query.article = article;
    } else {
      throw new BadRequestException(exceptionMessages.invalid.report);
    }

    const exists: boolean = await this.reportService.check(query);
    if (!exists) {
      await this.reportService.newReport(query);
    }
  }
}
