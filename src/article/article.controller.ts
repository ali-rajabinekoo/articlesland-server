import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Ip,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Headers,
  Query,
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
import { RequestFormat, UserResDto } from '../user/user.dto';
import {
  ArticleDto,
  ArticleResDto,
  CategoryArticlesDto,
  EditArticleDto,
  GetArticleResponse,
  PublishArticleDto,
  PublishArticleSchema,
  ViewedArticleResponse,
} from './article.dto';
import { CategoryService } from '../category/category.service';
import { exceptionMessages, validationMessages } from '../libs/messages';
import {
  bannerStorage,
  imageFileFilter,
  imageSize,
} from '../libs/file-uploading.utils';
import { join } from 'path';
import utils from '../libs/utils/index';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { AuthService } from '../auth/auth.service';
import { getArticleLimit } from '../libs/config';
import { NotificationService } from '../notification/notification.service';

@Controller('article')
@ApiTags('article')
@UseInterceptors(ClassSerializerInterceptor)
@ApiUnauthorizedResponse({ description: 'Unauthorized', type: UnauthorizedDto })
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
export class ArticleController {
  constructor(
    private articleService: ArticleService,
    private categoryService: CategoryService,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  @Get('/explore')
  @ApiCreatedResponse({
    description: 'Returns articles of category.',
    type: Article,
  })
  @ApiNotFoundResponse({ description: 'Category not found.' })
  async getArticlesByCategory(
    @Req() req: RequestFormat,
    @Headers() headers: any,
    @Query('categories') categoryId?: string | undefined,
    @Query('users') usersId?: string | undefined,
    @Query('page') pageNumber?: number | undefined,
    @Query('keyword') keywordQuery?: string | undefined,
    @Query('mostPopular') mostPopularQuery?: number | undefined,
  ): Promise<CategoryArticlesDto> {
    // queries
    const categories: number[] | undefined = categoryId
      ?.split(',')
      ?.filter((el) => !!el)
      ?.map((el) => Number(el));
    const newUsersId: number[] | undefined = usersId
      ?.split(',')
      ?.filter((el) => !!el)
      ?.map((el) => Number(el));
    const page: number = isNaN(Number(pageNumber)) ? 0 : pageNumber;
    const keyword: string | undefined = keywordQuery?.trim() || undefined;
    const mostPopular = Boolean(mostPopularQuery);

    const users: number[] | undefined = !!newUsersId
      ? (
          await Promise.all(
            newUsersId.map(async (el: number) => {
              const user: User = await this.userService.findUserById(el);
              if (!!user) return user.id;
              return null;
            }),
          )
        ).filter((el) => el !== null)
      : undefined;
    const userId: number = await this.authService.authorization(headers);
    let user: User | null = null;
    const likes: object = {};
    const bookmarks: object = {};
    if (!!userId) {
      user = await this.userService.findUserById(userId);
      if (Array.isArray(user?.likes) && user?.likes.length !== 0) {
        await Promise.all(
          user.likes.map(async (el: Article): Promise<void> => {
            likes[el.id] = true;
          }),
        );
      }
      if (Array.isArray(user?.bookmarks) && user?.bookmarks.length !== 0) {
        await Promise.all(
          user.bookmarks.map(async (el: Article): Promise<void> => {
            bookmarks[el.id] = true;
          }),
        );
      }
    }
    const [articles, totalArticles] =
      await this.articleService.getArticlesByCategory(
        categories?.length === 0 ? undefined : categories,
        users?.length === 0 ? undefined : users,
        page,
        keyword,
        mostPopular,
      );
    const formattedArticles: ArticleResDto[] = await Promise.all(
      articles.map(async (el: Article) => {
        return new ArticleResDto(el);
      }),
    );
    const response: CategoryArticlesDto = {
      articles: formattedArticles,
      totalPages: Math.ceil(totalArticles / getArticleLimit),
      count: totalArticles,
    };
    if (!!bookmarks) response.bookmarks = bookmarks;
    if (!!likes) response.likes = likes;
    return response;
  }

  @Get('/public/:username/:id')
  @ApiCreatedResponse({
    description: 'Returns article.',
    type: Article,
  })
  @ApiNotFoundResponse({ description: 'Article not found.' })
  async getArticleForOtherUsers(
    @Param('id') id: number,
    @Param('username') username: string,
    @Ip() ipAddress: string,
  ): Promise<ArticleResDto> {
    const article: Article = await this.articleService.findArticleById(id);
    if (!article || !article.published || article.owner.username !== username) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    const response: GetArticleResponse = { ...article } as GetArticleResponse;
    response.body = await this.articleService.fetchArticleBody(article.bodyUrl);
    utils.views
      .setView(id, ipAddress)
      .then((viewedByThisUser: boolean) => {
        if (!viewedByThisUser) {
          article.viewed = (article.viewed || 0) + 1;
          return this.articleService.saveArticle(article).catch();
        }
      })
      .catch();
    return new ArticleResDto(response);
  }

  @Get('/mine')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    description: 'Returns article.',
    type: Article,
  })
  @ApiNotFoundResponse({ description: 'Article not found.' })
  async getMyArticle(@Req() req: RequestFormat): Promise<ArticleResDto[]> {
    const user: User = await this.userService.findUserById(req.user.id);
    const articles: Article[] = user.articles as Article[];
    return Promise.all(
      articles.map(async (el: Article): Promise<ArticleResDto> => {
        const newEl: ViewedArticleResponse = { ...el } as ViewedArticleResponse;
        newEl.todayViews = (await utils.views.getView(el.id)) || 0;
        return new ArticleResDto(newEl);
      }),
    );
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    description: 'Returns article.',
    type: Article,
  })
  @ApiNotFoundResponse({ description: 'Article not found.' })
  async getArticle(
    @Req() req: RequestFormat,
    @Param('id') id: number,
  ): Promise<ArticleResDto> {
    const article: Article = await this.articleService.findArticleById(id);
    if (!article || article.owner.id !== req.user.id) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    const response: GetArticleResponse = article as GetArticleResponse;
    response.body = await this.articleService.fetchArticleBody(article.bodyUrl);
    return new ArticleResDto(response);
  }

  @Post()
  @HttpCode(201)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  ): Promise<ArticleResDto> {
    if (await utils.admin.checkIsBlocked(req.user.id)) {
      throw new ForbiddenException(
        exceptionMessages.forbidden.youBlockedByAdmin,
      );
    }
    const duplicatedArticle: Article =
      await this.articleService.findArticleByTitle(body.title);
    if (!!duplicatedArticle) {
      throw new ConflictException(exceptionMessages.exist.articleTitle);
    }
    return new ArticleResDto(
      await this.articleService.addNewArticle(body, req.user),
    );
  }

  @Put('/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  ): Promise<ArticleResDto> {
    if (await utils.admin.checkIsBlocked(req.user.id)) {
      throw new ForbiddenException(
        exceptionMessages.forbidden.youBlockedByAdmin,
      );
    }
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
    return new ArticleResDto(response);
  }

  @Patch('/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  ): Promise<ArticleResDto> {
    if (await utils.admin.checkIsBlocked(req.user.id)) {
      throw new ForbiddenException(
        exceptionMessages.forbidden.youBlockedByAdmin,
      );
    }
    try {
      const article: Article = await this.articleService.findArticleById(id);
      (() => {
        if (!article) {
          throw new NotFoundException(exceptionMessages.notFound.article);
        }
        if (!article.bannerUrl && !file) {
          throw new BadRequestException(validationMessages.empty.articleBanner);
        }
        if (article.owner.id !== req.user.id) {
          throw new ForbiddenException(exceptionMessages.permission.main);
        }
      })();
      const category = await this.categoryService.getCategoryById(
        Number(body.categoryId),
      );
      (() => {
        if (!category) {
          throw new NotFoundException(exceptionMessages.notFound.category);
        }
      })();
      const result = await this.articleService.publishArticle(
        article,
        file?.path,
        category,
      );
      return new ArticleResDto(result);
    } catch (e) {
      try {
        const filePath: string = join(__dirname, `../../${file?.path}`);
        await this.articleService.removeSavedFile(filePath);
      } catch {}
      throw e;
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
    if (article.owner.id !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenException(exceptionMessages.permission.main);
    }
    await this.articleService.removeArticle(article);
  }

  // @Post('publish/:id')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @ApiNotFoundResponse({ description: 'Article not found.' })
  // @ApiBadRequestResponse({ description: 'Id parameter required.' })
  // @ApiForbiddenResponse({
  //   description: "You don't have permission",
  // })
  // @ApiOkResponse({
  //   description: 'Article published.',
  //   type: Article,
  // })
  // async publishArticle(
  //   @Req() req: RequestFormat,
  //   @Param('id') id: number,
  // ): Promise<Article> {
  //   const article: Article = await this.articleService.findArticleById(id);
  //   if (!article) {
  //     throw new NotFoundException(exceptionMessages.notFound.article);
  //   }
  //   if (article.owner.id !== req.user.id) {
  //     throw new ForbiddenException(exceptionMessages.permission.main);
  //   }
  //   article.published = true;
  //   return this.articleService.saveArticle(article);
  // }

  @Post('drop/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  ): Promise<ArticleResDto> {
    const article: Article = await this.articleService.findArticleById(id);
    if (!article) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    if (article.owner.id !== req.user.id) {
      throw new ForbiddenException(exceptionMessages.permission.main);
    }
    article.published = false;
    return new ArticleResDto(await this.articleService.saveArticle(article));
  }

  @Post('bookmark/:articleId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiOkResponse({
    description: 'The article add to bookmark list.',
    type: User,
  })
  async addBookmark(
    @Param('articleId') articleId: number,
    @Req() req: RequestFormat,
  ): Promise<ArticleResDto[]> {
    if (await utils.admin.checkIsBlocked(req.user.id)) {
      throw new ForbiddenException(
        exceptionMessages.forbidden.youBlockedByAdmin,
      );
    }
    const article: Article = await this.articleService.findArticleById(
      articleId,
    );
    if (!article || !article?.published) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    if (!!article.owner.blockedUsers.find((el) => el.id === req.user.id)) {
      throw new ForbiddenException(
        exceptionMessages.forbidden.youBlockedByUser,
      );
    }
    const user: User = await this.userService.findUserById(req.user.id);
    user.bookmarks.push(article);
    await this.userService.saveUser(user);
    const serializedUser = new UserResDto(user);
    return serializedUser.bookmarks;
  }

  @Delete('bookmark/:articleId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiOkResponse({
    description: 'The article removed from bookmark list.',
    type: User,
  })
  async removeBookmark(
    @Param('articleId') articleId: number,
    @Req() req: RequestFormat,
  ): Promise<ArticleResDto[]> {
    const article: Article = await this.articleService.findArticleById(
      articleId,
    );
    if (!article || !article?.published) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    const user: User = await this.userService.findUserById(req.user.id);
    user.bookmarks = user.bookmarks.filter(
      (el: Article) => el.id !== article.id,
    );
    await this.userService.saveUser(user);
    const serializedUser = new UserResDto(user);
    return serializedUser.bookmarks;
  }

  @Post('like/:articleId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiOkResponse({
    description: 'User likes this article.',
    type: User,
  })
  async addLike(
    @Param('articleId') articleId: number,
    @Req() req: RequestFormat,
  ): Promise<ArticleResDto[]> {
    if (await utils.admin.checkIsBlocked(req.user.id)) {
      throw new ForbiddenException(
        exceptionMessages.forbidden.youBlockedByAdmin,
      );
    }
    let article: Article = await this.articleService.findArticleById(articleId);
    if (!article || !article?.published) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    if (!!article.owner.blockedUsers.find((el) => el.id === req.user.id)) {
      throw new ForbiddenException(
        exceptionMessages.forbidden.youBlockedByUser,
      );
    }
    const user: User = await this.userService.findUserById(req.user.id);
    const existLike: Article = user.likes.find((el) => el.id === article.id);
    if (!existLike) {
      article.likesNumber = (article.likesNumber || 0) + 1;
      article = await this.articleService.saveArticle(article);
      user.likes.push(article);
      await this.userService.saveUser(user);
    }
    if (user?.id !== article?.owner?.id) {
      this.notificationService
        .newNotification({
          type: 'like',
          article,
          creator: user,
          owner: article.owner,
        })
        .catch();
    }
    const serializedUser = new UserResDto(user);
    return serializedUser.likes;
  }

  @Delete('like/:articleId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiOkResponse({
    description: 'User removed from article likes.',
    type: User,
  })
  async removeLike(
    @Param('articleId') articleId: number,
    @Req() req: RequestFormat,
  ): Promise<ArticleResDto[]> {
    const article: Article = await this.articleService.findArticleById(
      articleId,
    );
    if (!article || !article?.published) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    const user: User = await this.userService.findUserById(req.user.id);
    const existLikeIndex: number = user.likes.findIndex(
      (el: Article) => el.id === article.id,
    );
    if (existLikeIndex > -1) {
      const articleInstance: Article = user.likes[existLikeIndex];
      articleInstance.likesNumber = (articleInstance.likesNumber || 0) - 1;
      await this.articleService.saveArticle(articleInstance);
      user.likes.splice(existLikeIndex, 1);
      await this.userService.saveUser(user);
    }
    const serializedUser = new UserResDto(user);
    return serializedUser.likes;
  }
}
