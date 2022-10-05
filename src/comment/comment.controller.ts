import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UnauthorizedDto } from '../auth/auth.dto';
import { User } from '../user/user.entity';
import { RequestFormat } from '../user/user.dto';
import { CommentResDto, NewCommentDto } from './comment.dto';
import { Comment } from './comment.entity';
import { Article } from '../article/article.entity';
import { ArticleService } from '../article/article.service';
import { exceptionMessages } from '../libs/messages';
import { ArticleResDto } from '../article/article.dto';
import { NotificationService } from '../notification/notification.service';

@Controller('comment')
@ApiBearerAuth()
@ApiTags('comment')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({ description: 'Unauthorized', type: UnauthorizedDto })
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
export class CommentController {
  constructor(
    private commentService: CommentService,
    private articleService: ArticleService,
    private notificationService: NotificationService,
  ) {}

  @Post(':articleId')
  @HttpCode(201)
  @ApiOkResponse({
    description: 'Returns new comment.',
    type: Comment,
  })
  @ApiNotFoundResponse({
    description: 'The article not found.',
  })
  async getUserInformation(
    @Req() req: RequestFormat,
    @Body() body: NewCommentDto,
    @Param('articleId') articleId: number,
  ): Promise<CommentResDto> {
    const article: Article = await this.articleService.findArticleById(
      articleId,
    );
    if (!article) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    let parentComment: Comment | undefined;
    if (!!body?.parentId) {
      const comment: Comment = await this.commentService.findCommentById(
        Number(body.parentId),
      );
      if (!!comment) parentComment = comment;
    }
    if (req.user?.id !== article?.owner?.id) {
      this.notificationService
        .newNotification({
          type: 'comment',
          article,
          creator: req.user,
          owner: article.owner,
          content: body.body,
        })
        .catch();
    }
    return new CommentResDto(
      await this.commentService.addNewComment(
        req.user as User,
        article,
        body,
        parentComment,
      ),
    );
  }

  @Delete(':articleId/:commentId')
  @ApiOkResponse({
    description: 'Comment removed successfully.',
  })
  @ApiForbiddenResponse({
    description: 'This comment is not yours.',
  })
  @ApiNotFoundResponse({
    description: 'The comment not found.',
  })
  async removeComment(
    @Req() req: RequestFormat,
    @Param('articleId') articleId: number,
    @Param('commentId') commentId: number,
  ): Promise<CommentResDto[]> {
    const comment: Comment = await this.commentService.findCommentById(
      commentId,
    );
    if (!comment || comment?.article?.id !== articleId) {
      throw new NotFoundException(exceptionMessages.notFound.comment);
    }
    if (comment?.owner?.id !== req.user.id) {
      throw new ForbiddenException(exceptionMessages.permission.main);
    }
    const parentComment: Comment = { ...comment.parent };
    if (!!parentComment?.id) {
      parentComment.childNumber = !!parentComment?.childNumber
        ? parentComment.childNumber - 1
        : 0;
      await this.commentService.saveComment(parentComment);
    }
    await this.commentService.removeComment(comment);
    const article: ArticleResDto = new ArticleResDto(
      await this.articleService.findArticleById(articleId),
    );
    return article.comments;
  }
}
