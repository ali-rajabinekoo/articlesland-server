import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LinkService } from './link.service';
import { LinkResDto } from './link.dto';
import { exceptionMessages } from '../libs/messages';
import { ArticleService } from '../article/article.service';
import { Article } from '../article/article.entity';
import utils from '../libs/utils';

@Controller('link')
@ApiTags('link')
@UseInterceptors(ClassSerializerInterceptor)
export class LinkController {
  constructor(
    private linkService: LinkService,
    private articleService: ArticleService,
  ) {}

  @Get(':shortLinkKey')
  @ApiOkResponse({
    description: 'Returns id and username',
    type: LinkResDto,
  })
  async categoryList(
    @Param('shortLinkKey') shortLinkKey: string,
  ): Promise<LinkResDto> {
    const savedPattern: string = await utils.shortLink.getShortLink(
      shortLinkKey,
    );
    if (!savedPattern) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    let id: string;
    try {
      id = savedPattern.split('-')[1];
      if (!id) {
        (() => {
          throw new NotFoundException(exceptionMessages.notFound.article);
        })();
      }
    } catch (e) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    const article: Article = await this.articleService.findArticleById(
      Number(id),
    );
    if (!article) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    return {
      username: article.owner.username,
      id: article.id,
    } as LinkResDto;
  }

  @Post(':id')
  @ApiOkResponse({
    description: 'Short link generated successfully',
    type: LinkResDto,
  })
  async generateLink(@Param('id') id: string): Promise<string> {
    const article: Article = await this.articleService.findArticleById(
      Number(id),
    );
    if (!article) {
      throw new NotFoundException(exceptionMessages.notFound.article);
    }
    return utils.shortLink.setShortLink(article.id);
  }
}
