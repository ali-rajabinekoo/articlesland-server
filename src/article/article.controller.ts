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
  Delete,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
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
import { ArticleDto, EditArticleDto, NewArticleSchema } from './article.dto';
import { CategoryService } from '../category/category.service';
import { Category } from '../category/category.entity';
import { exceptionMessages, validationMessages } from '../libs/messages';
import {
  imageFileFilter,
  imageSize,
  imageStorage,
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

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: imageStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: imageSize },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: NewArticleSchema,
  })
  @ApiOkResponse({
    description: 'Avatar updated.',
    type: Article,
  })
  @ApiBadRequestResponse({
    description: [
      'Banner is empty.',
      'Banner should be jpg, jpeg, png.',
      'Banner size should be lower then 2mb.',
    ].join(' | '),
  })
  @ApiConflictResponse({
    description: 'Article already exists with this title.',
  })
  @ApiNotFoundResponse({ description: 'Category not found.' })
  async createNewArticle(
    @Req() req: RequestFormat,
    @Body() body: ArticleDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Article> {
    try {
      if (!file) {
        throw new BadRequestException(validationMessages.empty.articleBanner);
      }
      const duplicatedArticle: Article =
        await this.articleService.findArticleByTitle(body.title);
      if (!!duplicatedArticle) {
        throw new ConflictException(exceptionMessages.exist.articleTitle);
      }
      const category: Category = await this.categoryService.getArticleById(
        Number(body.categoryId),
      );
      if (!category) {
        throw new NotFoundException(exceptionMessages.notFound.category);
      }
      return this.articleService.addNewArticle(
        body,
        category,
        req.user,
        file.path,
      );
    } catch (e) {
      try {
        const filePath: string = join(__dirname, `../../${file?.path}`);
        await this.articleService.removeSavedFile(filePath);
      } catch {}
      throw e;
    }
  }

  @Put('/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: imageStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: imageSize },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: NewArticleSchema,
  })
  @ApiOkResponse({
    description: 'Avatar updated.',
    type: Article,
  })
  @ApiBadRequestResponse({
    description: [
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
  async updateArticle(
    @Req() req: RequestFormat,
    @Body() body: EditArticleDto,
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Article> {
    try {
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
        if (!!duplicatedArticle) {
          throw new ConflictException(exceptionMessages.exist.articleTitle);
        }
      }
      let category: Category;
      if (
        !!body.categoryId &&
        Number(body.categoryId) !== article.category.id
      ) {
        category = await this.categoryService.getArticleById(
          Number(body.categoryId),
        );
        if (!category) {
          throw new NotFoundException(exceptionMessages.notFound.category);
        }
      }
      return this.articleService.updateArticle(
        article,
        body,
        file?.path,
        category,
      );
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
}
