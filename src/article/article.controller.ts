import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  NotFoundException,
  Post,
  Req,
  Put,
  Param,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ForbiddenException,
  BadRequestException,
  Get,
  Delete,
  Patch,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UnauthorizedDto } from '../auth/auth.dto';
import { ArticleService } from './article.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Article } from './article.entity';
import { RequestFormat } from '../user/user.dto';
import {
  ArticleDto,
  EditArticleDto,
  GetArticleResponse,
  PublishArticleDto,
  PublishArticleSchema,
} from './article.dto';
import { CategoryService } from '../category/category.service';
import { Category } from '../category/category.entity';
import { exceptionMessages, validationMessages } from '../libs/messages';
import {
  imageFileFilter,
  imageSize,
  bannerStorage,
} from '../libs/file-uploading.utils';
import { join } from 'path';

@Controller('article')
@ApiBearerAuth()
@ApiTags('article')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({ description: 'Unauthorized', type: UnauthorizedDto })
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
export class ArticleController {
  constructor(
    private articleService: ArticleService,
    private categoryService: CategoryService,
  ) {}

  @Get(':id')
  @ApiCreatedResponse({
    description: 'Returns article.',
    type: Article,
  })
  @ApiNotFoundResponse({ description: 'Article not found.' })
  async getArticle(
    @Req() req: RequestFormat,
    @Param('id') id: number,
  ): Promise<GetArticleResponse> {
    const article: Article = await this.articleService.findArticleById(id);
    if (!article) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    const response: GetArticleResponse = article as GetArticleResponse;
    response.body = await this.articleService.fetchArticleBody(article.bodyUrl);
    return response;
  }

  @Post()
  @HttpCode(201)
  @ApiCreatedResponse({
    description: 'Article created.',
    type: Article,
  })
  @ApiConflictResponse({
    description: 'Article already exists with this title.',
  })
  @ApiNotFoundResponse({ description: 'Category not found.' })
  async createNewArticle(
    @Req() req: RequestFormat,
    @Body() body: ArticleDto,
  ): Promise<Article> {
    const duplicatedArticle: Article =
      await this.articleService.findArticleByTitle(body.title);
    if (!!duplicatedArticle) {
      throw new ConflictException(exceptionMessages.exist.articleTitle);
    }
    return this.articleService.addNewArticle(body, req.user);
  }

  @Put('/:id')
  @ApiOkResponse({
    description: 'Article updated.',
    type: Article,
  })
  @ApiBadRequestResponse({
    description: ['Id parameter required'].join(' | '),
  })
  @ApiConflictResponse({
    description: 'Article already exists with this title.',
  })
  @ApiNotFoundResponse({
    description: ['Category not found.', 'Article not found.'].join(' | '),
  })
  @ApiForbiddenResponse({
    description: "You don't have permission",
  })
  async updateArticle(
    @Req() req: RequestFormat,
    @Body() body: EditArticleDto,
    @Param('id') id: number,
  ): Promise<GetArticleResponse> {
    const article: Article = await this.articleService.findArticleById(id);
    if (!article) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    if (article.owner.id !== req.user.id) {
      throw new ForbiddenException(exceptionMessages.permission.main);
    }
    if (!!body.title && body.title.trim() !== article.title.trim()) {
      const duplicatedArticle: Article =
        await this.articleService.findArticleByTitle(body.title);
      if (!!duplicatedArticle && Number(duplicatedArticle.id) !== Number(id)) {
        throw new ConflictException(exceptionMessages.exist.articleTitle);
      }
    }
    const response: GetArticleResponse =
      await this.articleService.updateArticle(article, body);
    response.body = await this.articleService.fetchArticleBody(article.bodyUrl);
    return response;
  }

  @Patch('/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: bannerStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: imageSize },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: PublishArticleSchema,
  })
  @ApiOkResponse({
    description: 'Article published.',
    type: Article,
  })
  @ApiBadRequestResponse({
    description: [
      'Article has empty banner.',
      'Banner should be jpg, jpeg, png.',
      'Banner size should be lower then 2mb.',
      'Id parameter required',
    ].join(' | '),
  })
  @ApiConflictResponse({
    description: 'Article already exists with this title.',
  })
  @ApiNotFoundResponse({
    description: ['Category not found.', 'Article not found.'].join(' | '),
  })
  @ApiForbiddenResponse({
    description: "You don't have permission",
  })
  async saveAndPublishArticle(
    @Req() req: RequestFormat,
    @Body() body: PublishArticleDto,
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Article> {
    try {
      const article: Article = await this.articleService.findArticleById(id);
      if (!article) {
        throw new NotFoundException(exceptionMessages.notFound.article);
      }
      if (!article.bannerUrl && !file) {
        throw new BadRequestException(validationMessages.empty.articleBanner);
      }
      if (article.owner.id !== req.user.id) {
        throw new ForbiddenException(exceptionMessages.permission.main);
      }
      let category: Category;
      if (
        !!body.categoryId &&
        !!article?.category?.id &&
        !!body?.categoryId &&
        Number(body?.categoryId) !== article?.category?.id
      ) {
        category = await this.categoryService.getArticleById(
          Number(body.categoryId),
        );
        if (!category) {
          throw new NotFoundException(exceptionMessages.notFound.category);
        }
      }
      return this.articleService.publishArticle(article, file?.path, category);
    } catch (e) {
      try {
        const filePath: string = join(__dirname, `../../${file?.path}`);
        await this.articleService.removeSavedFile(filePath);
      } catch {}
      throw e;
    }
  }

  @Delete(':id')
  @ApiNotFoundResponse({ description: 'Article not found.' })
  @ApiBadRequestResponse({ description: 'Id parameter required.' })
  @ApiForbiddenResponse({
    description: "You don't have permission",
  })
  async removeArticle(
    @Req() req: RequestFormat,
    @Param('id') id: number,
  ): Promise<void> {
    const article: Article = await this.articleService.findArticleById(id);
    if (!article) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    if (article.owner.id !== req.user.id) {
      throw new ForbiddenException(exceptionMessages.permission.main);
    }
    await this.articleService.removeArticle(article);
  }

  @Post('publish/:id')
  @ApiNotFoundResponse({ description: 'Article not found.' })
  @ApiBadRequestResponse({ description: 'Id parameter required.' })
  @ApiForbiddenResponse({
    description: "You don't have permission",
  })
  @ApiOkResponse({
    description: 'Article published.',
    type: Article,
  })
  async publishArticle(
    @Req() req: RequestFormat,
    @Param('id') id: number,
  ): Promise<Article> {
    const article: Article = await this.articleService.findArticleById(id);
    if (!article) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    if (article.owner.id !== req.user.id) {
      throw new ForbiddenException(exceptionMessages.permission.main);
    }
    article.published = true;
    return this.articleService.saveArticle(article);
  }

  @Post('drop/:id')
  @ApiNotFoundResponse({ description: 'Article not found.' })
  @ApiBadRequestResponse({ description: 'Id parameter required.' })
  @ApiForbiddenResponse({
    description: "You don't have permission",
  })
  @ApiOkResponse({
    description: 'Published article canceled.',
    type: Article,
  })
  async dropArticle(
    @Req() req: RequestFormat,
    @Param('id') id: number,
  ): Promise<Article> {
    const article: Article = await this.articleService.findArticleById(id);
    if (!article) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    if (article.owner.id !== req.user.id) {
      throw new ForbiddenException(exceptionMessages.permission.main);
    }
    article.published = false;
    return this.articleService.saveArticle(article);
  }
}
