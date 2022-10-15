import * as Keyv from 'keyv';
import { database } from '../config';

export class AdminUtils {
  private keyValueClient = new Keyv(
    process.env.NODE_ENV === 'test' ? database.keyvTest : database.keyv,
    { namespace: 'admin' },
  );

  async blockUser(userId: number): Promise<void> {
    await this.keyValueClient.set(`block-${userId}`, true);
  }

  async unblockUser(userId: number): Promise<void> {
    await this.keyValueClient.delete(`block-${userId}`);
  }

  async checkIsBlocked(userId: number): Promise<boolean> {
    return Boolean(await this.keyValueClient.get(`block-${userId}`));
  }
}
