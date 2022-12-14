import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './article.entity';
import {
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  In,
  Repository,
} from 'typeorm';
import { ArticleDto, EditArticleDto } from './article.dto';
import * as fs from 'fs/promises';
import { join } from 'path';
import { v4 as uuidV4 } from 'uuid';
import { Category } from '../category/category.entity';
import { User } from '../user/user.entity';
import { htmlToText } from 'html-to-text';
import { getArticleLimit } from '../libs/config';
import utils from '../libs/utils';

@Injectable()
export class ArticleService {
  private mainArticlesDirectoryCreated = false;

  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
  ) {}

  private generateArticleName(): string {
    return join(__dirname, `../../public/articles/${uuidV4()}.html`);
  }

  private async checkMainArticlesDirectories(): Promise<void> {
    const articleDir: string = join(__dirname, '../../public/articles');
    const catDir: string = join(__dirname, `../../public/articles/`);
    try {
      await fs.readdir(articleDir);
    } catch {
      await fs.mkdir(articleDir);
    }
    try {
      await fs.readdir(catDir);
    } catch {
      await fs.mkdir(catDir);
    }
    this.mainArticlesDirectoryCreated = true;
  }

  private async saveArticleBody(body: string): Promise<string> {
    if (!this.mainArticlesDirectoryCreated) {
      await this.checkMainArticlesDirectories();
    }
    let filePath: string = this.generateArticleName();
    let exist = true;
    while (exist) {
      try {
        await fs.readFile(filePath);
        filePath = this.generateArticleName();
      } catch {
        exist = false;
      }
    }
    await fs.writeFile(filePath, body, 'utf8');
    return filePath;
  }

  private async updateArticleBody(url: string, body: string): Promise<void> {
    const filePath: string = this.urlToBodyPath(url);
    await fs.writeFile(filePath, body, 'utf8');
  }

  async fetchArticleBody(url: string): Promise<string> {
    const filePath: string = this.urlToBodyPath(url);
    return await fs.readFile(filePath, 'utf8');
  }

  async removeSavedFile(bodyPath: string): Promise<void> {
    await fs.unlink(bodyPath);
  }

  private bodyPathToUrl(bodyPath: string): string {
    return '/statics' + bodyPath.split('public')[1];
  }

  private urlToBodyPath(url: string): string {
    return join(__dirname, `../../${url.replace('/statics', 'public')}`);
  }

  private formatDescription(description: string): string {
    return htmlToText(description).slice(0, 200);
  }

  async addNewArticle(fields: ArticleDto, owner: User): Promise<Article> {
    const bodyPath: string = await this.saveArticleBody(
      utils.auxiliary.HtmlTagsNormalizer(fields.body),
    );
    try {
      const newArticle: Article = await this.articlesRepository.create({
        title: fields.title.trim(),
        bodyUrl: this.bodyPathToUrl(bodyPath),
        description: this.formatDescription(fields.body.trim()),
        owner,
      });
      return await this.articlesRepository.save(newArticle);
    } catch (e) {
      await this.removeSavedFile(bodyPath);
      throw e;
    }
  }

  async updateArticle(
    mainArticle: Article,
    newInfo: EditArticleDto,
  ): Promise<Article> {
    if (!!newInfo.body) {
      await this.updateArticleBody(
        mainArticle.bodyUrl,
        utils.auxiliary.HtmlTagsNormalizer(newInfo.body),
      );
      mainArticle.description = this.formatDescription(newInfo.body.trim());
    }
    if (!!newInfo.title) {
      mainArticle.title = newInfo.title.trim();
    }

    return this.articlesRepository.save(mainArticle);
  }

  async publishArticle(
    mainArticle: Article,
    bannerUrl?: string | undefined,
    category?: Category | undefined,
  ): Promise<Article> {
    if (!!category) {
      mainArticle.category = category;
    }
    if (!!bannerUrl) {
      if (!!mainArticle.bannerUrl) {
        try {
          await this.removeSavedFile(this.urlToBodyPath(mainArticle.bannerUrl));
        } catch (e) {}
      }
      mainArticle.bannerUrl = this.bodyPathToUrl(bannerUrl);
    }
    mainArticle.published = true;
    return this.articlesRepository.save(mainArticle);
  }

  public async saveArticle(article: Article): Promise<Article> {
    return this.articlesRepository.save(article);
  }

  async findArticleByTitle(title: string): Promise<Article> {
    return this.articlesRepository.findOne({
      where: {
        title: title.trim(),
      },
      relations: ['owner', 'category', 'reports', 'likes', 'comments'],
    });
  }

  async findArticleById(id: number): Promise<Article> {
    return await this.articlesRepository.findOne({
      where: {
        id,
      },
      relations: [
        'owner',
        'owner.blockedUsers',
        'category',
        'reports',
        'likes',
        'comments',
        'comments.owner',
        'comments.parent',
        'comments.parent.owner',
        'comments.children.owner',
      ],
    });
  }

  async removeArticle(article: Article): Promise<void> {
    if (!!article?.bodyUrl) {
      try {
        await this.removeSavedFile(this.urlToBodyPath(article.bodyUrl));
      } catch {}
    }
    if (!!article?.bannerUrl) {
      try {
        await this.removeSavedFile(this.urlToBodyPath(article.bannerUrl));
      } catch {}
    }
    await this.articlesRepository.remove(article);
  }

  async getArticlesByCategory(
    categories: number[] | undefined,
    users: number[] | undefined,
    page?: number | undefined,
    keyword?: string | undefined,
    mostPopular?: boolean,
  ): Promise<[Article[], number]> {
    const wheres: { [key: string]: FindOptionsWhere<Article> } = {};
    wheres.where = { published: true };
    if (!!categories) {
      wheres.where = { ...wheres.where, category: { id: In(categories) } };
    }
    if (!!users) {
      wheres.where = { ...wheres.where, owner: { id: In(users) } };
    }
    if (!!keyword) {
      const whereInstance: FindOptionsWhere<Article> = { ...wheres.where };
      wheres.where2 = { ...whereInstance, description: ILike(`%${keyword}%`) };
      wheres.where = { ...whereInstance, title: ILike(`%${keyword}%`) };
    }
    const options: FindManyOptions = {
      relations: ['category', 'likes', 'owner'],
      order: mostPopular ? { likesNumber: 'desc' } : { created_at: 'desc' },
      skip: getArticleLimit * (page || 1) - getArticleLimit || 0,
      take: getArticleLimit,
    };
    if (Object.keys(wheres).length === 1) {
      options.where = wheres.where;
    } else {
      const whereClauseArray = [];
      for (const whereClause in wheres) {
        whereClauseArray.push(wheres[whereClause]);
      }
      options.where = whereClauseArray;
    }
    return this.articlesRepository.findAndCount(options);
  }

  async findArticleByOwner(id: number): Promise<Article> {
    return await this.articlesRepository.findOne({
      where: {
        owner: { id },
      },
      relations: [
        'owner',
        'owner.blockedUsers',
        'category',
        'reports',
        'likes',
        'comments',
        'comments.owner',
        'comments.parent',
        'comments.parent.owner',
        'comments.children.owner',
      ],
    });
  }
}
