import * as Keyv from 'keyv';
import { database } from '../config';
import { v4 as uuidV4 } from 'uuid';

export class ShortLinkUtils {
  private keyValueClient = new Keyv(
    process.env.NODE_ENV === 'test' ? database.keyvTest : database.keyv,
    { namespace: 'shortLink' },
  );

  async clearKeyValueTable(): Promise<void> {
    await this.keyValueClient.clear();
  }

  private generateShortLinkKey(articleId: number): string {
    return `link-${articleId}`;
  }

  private generateUniqueString(): string {
    const uniqueKey: string = uuidV4();
    return uniqueKey.split('-')[0];
  }

  async setShortLink(articleId: number): Promise<string> {
    const shortLink: string = this.generateShortLinkKey(articleId);
    const checkExist: string = await this.keyValueClient.get(shortLink);
    if (!!checkExist) return checkExist;
    let uniqueKey: string = this.generateUniqueString();
    while (await this.keyValueClient.get(uniqueKey)) {
      uniqueKey = this.generateUniqueString();
    }
    await this.keyValueClient.set(uniqueKey, shortLink);
    await this.keyValueClient.set(shortLink, uniqueKey);
    return uniqueKey;
  }

  async getShortLink(uniqueKey: string): Promise<string> {
    return this.keyValueClient.get(uniqueKey);
  }
}
