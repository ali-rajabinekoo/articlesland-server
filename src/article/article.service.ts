import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { Repository } from 'typeorm';
import { ArticleDto, EditArticleDto } from './article.dto';
import * as fs from 'fs/promises';
import { join } from 'path';
import { v4 as uuidV4 } from 'uuid';
import { Category } from '../category/category.entity';
import { User } from '../user/user.entity';
import { htmlToText } from 'html-to-text';

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
    const bodyPath: string = await this.saveArticleBody(fields.body.trim());
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
      await this.updateArticleBody(mainArticle.bodyUrl, newInfo.body);
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

  async saveArticle(article: Article): Promise<Article> {
    return this.articlesRepository.save(article);
  }

  async findArticleByTitle(title: string): Promise<Article> {
    return this.articlesRepository.findOne({
      where: {
        title: title.trim(),
      },
      relations: [
        'owner',
        'category',
        'reports',
        'likes',
        'bookmarks',
        'comments',
      ],
    });
  }

  async findArticleById(id: number): Promise<Article> {
    return this.articlesRepository.findOne({
      where: {
        id,
      },
      relations: [
        'owner',
        'category',
        'reports',
        'likes',
        'bookmarks',
        'comments',
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
}
