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

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
  ) {
  }

  private async saveArticleBody(body: string, cat: string): Promise<string> {
    const articleDir: string = join(__dirname, '../../public/articles');
    const catDir: string = join(__dirname, `../../public/articles/${cat}/`);
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
    let filePath: string = join(
      __dirname,
      `../../public/articles/${cat}/f4ce6d5f-8ca1-472d-be2b-be1dd025bddc.html`,
    );
    let exist = true;
    while (exist) {
      try {
        await fs.readFile(filePath);
        filePath = join(
          __dirname,
          `../../public/articles/${cat}/${uuidV4()}.html`,
        );
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

  async removeSavedFile(bodyPath: string): Promise<void> {
    await fs.unlink(bodyPath);
  }

  private bodyPathToUrl(bodyPath: string): string {
    return '/statics' + bodyPath.split('public')[1];
  }

  private urlToBodyPath(url: string): string {
    return join(__dirname, `../../${url.replace('/statics', 'public')}`);
  }

  private normalizeCategoryDirName(title: string): string {
    return title.split(' ').join('-').toLowerCase();
  }

  async addNewArticle(
    fields: ArticleDto,
    category: Category,
    owner: User,
    bannerUrl: string,
  ): Promise<Article> {
    const bodyPath: string = await this.saveArticleBody(
      fields.body.trim(),
      this.normalizeCategoryDirName(category.title),
    );
    try {
      const newArticle: Article = await this.articlesRepository.create({
        title: fields.title.trim(),
        bodyUrl: this.bodyPathToUrl(bodyPath),
        owner,
        category,
        bannerUrl: this.bodyPathToUrl(bannerUrl),
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
    bannerUrl?: string | undefined,
    category?: Category | undefined,
  ): Promise<Article> {
    if (!!newInfo.body) {
      if (!category) {
        await this.updateArticleBody(mainArticle.bodyUrl, newInfo.body);
      } else {
        const bodyPath: string = await this.saveArticleBody(
          newInfo.body,
          this.normalizeCategoryDirName(category.title),
        );
        try {
          await this.removeSavedFile(this.urlToBodyPath(mainArticle.bodyUrl));
        } catch (e) {
        }
        mainArticle.bodyUrl = this.bodyPathToUrl(bodyPath);
      }
    }
    if (!!newInfo.title) {
      mainArticle.title = newInfo.title.trim();
    }
    if (!!category) {
      mainArticle.category = category;
    }
    if (!!bannerUrl) {
      if (!!mainArticle.bannerUrl) {
        try {
          await this.removeSavedFile(this.urlToBodyPath(mainArticle.bannerUrl));
        } catch (e) {
        }
      }
      mainArticle.bannerUrl = this.bodyPathToUrl(bannerUrl);
    }
    return this.articlesRepository.save(mainArticle);
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
      } catch {
      }
    }
    if (!!article?.bannerUrl) {
      try {
        await this.removeSavedFile(this.urlToBodyPath(article.bannerUrl));
      } catch {
      }
    }
    await this.articlesRepository.remove(article);
  }
}
