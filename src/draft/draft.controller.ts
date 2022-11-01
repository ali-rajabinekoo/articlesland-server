import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DraftService } from './draft.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestFormat } from '../user/user.dto';
import { DraftDto, DraftReqDto } from './draft.dto';
import { ArticleService } from '../article/article.service';
import { Article } from '../article/article.entity';
import { exceptionMessages } from '../libs/messages';

@Controller('draft')
@ApiTags('draft')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DraftController {
  constructor(
    private readonly draftService: DraftService,
    private readonly articleService: ArticleService,
  ) {}

  @Post('/:articleId')
  async saveDraft(
    @Param('articleId') articleId: number,
    @Body() fields: DraftReqDto,
    @Req() req: RequestFormat,
  ) {
    const article: Article = await this.articleService.findArticleById(
      articleId,
    );
    if (!article) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    const draft: DraftDto = new DraftDto();
    draft.articleId = articleId;
    draft.userId = req.user.id;
    draft.body = fields.body;
    if (!!fields.title) draft.title = fields.title;
    return this.draftService.saveDraft(draft);
  }

  @Post()
  async saveNewArticleDraft(
    @Body() fields: DraftReqDto,
    @Req() req: RequestFormat,
  ) {
    const draft: DraftDto = new DraftDto();
    draft.userId = req.user.id;
    draft.body = fields.body;
    if (!!fields.title) draft.title = fields.title;
    return this.draftService.saveDraft(draft);
  }

  @Get('/:articleId')
  async getArticleDrafts(
    @Param('articleId') articleId: number,
    @Req() req: RequestFormat,
  ) {
    return this.draftService.getUserDrafts(req.user.id, articleId);
  }

  @Get()
  async getNewArticleDrafts(@Req() req: RequestFormat) {
    return this.draftService.getUserDrafts(req.user.id);
  }

  @Delete('/remove/:id')
  async removeDraft(@Param('id') id: string, @Req() req: RequestFormat) {
    return this.draftService.removeDraft(req.user.id, id);
  }

  @Get('/greeting')
  async getHello() {
    return this.draftService.getHello();
  }
}
