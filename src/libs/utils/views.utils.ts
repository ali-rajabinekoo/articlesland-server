import * as Keyv from 'keyv';
import { database } from '../config';

export class Views {
  private keyValueClient = new Keyv(
    process.env.NODE_ENV === 'test' ? database.keyvTest : database.keyv,
    { namespace: 'views' },
  );

  async clearKeyValueTable(): Promise<void> {
    await this.keyValueClient.clear();
  }

  private generateViewCounterKey(articleId: number): string {
    return `counter-${articleId}`;
  }

  private async getArticleByIpAddress(ipAddress: string): Promise<string[]> {
    const articleIdsString: string = await this.keyValueClient.get(ipAddress);
    return typeof articleIdsString === 'string'
      ? articleIdsString.split(',').filter((el: string) => {
          return Boolean(el?.trim());
        })
      : [];
  }

  private async checkArticleViews(
    articleId: number,
    ipAddress: string,
  ): Promise<boolean> {
    const articleIds: string[] = await this.getArticleByIpAddress(ipAddress);
    return articleIds.includes(String(articleId));
  }

  private async increaseView(articleId: number): Promise<void> {
    const key: string = this.generateViewCounterKey(articleId);
    const viewsString: number = await this.keyValueClient.get(key);
    const viewCounter: number = !!viewsString ? Number(viewsString) : 0;
    await this.keyValueClient.set(key, viewCounter + 1);
  }

  // returns that article has viewed by this user at today
  async setView(articleId: number, ipAddress: string): Promise<boolean> {
    const viewedByUser: boolean = await this.checkArticleViews(
      articleId,
      ipAddress,
    );
    if (viewedByUser) return viewedByUser;
    const articleIds: string[] = await this.getArticleByIpAddress(ipAddress);
    articleIds.push(String(articleId));
    await this.keyValueClient.set(ipAddress, articleIds.join(','));
    await this.increaseView(articleId);
    return viewedByUser;
  }

  async getView(articleId: number): Promise<number> {
    const key: string = this.generateViewCounterKey(articleId);
    return this.keyValueClient.get(key);
  }
}
