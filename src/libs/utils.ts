import { User } from '../user/user.entity';
import * as Keyv from 'keyv';
import { v4 as uuidV4 } from 'uuid';
import { codeExpire, database } from './config';

class Utils {
  private keyvClient = new Keyv(
    process.env.NODE_ENV === 'test' ? database.keyvTest : database.keyv,
  );

  normalizePhoneNumber(mobile: string): string {
    let newMobile: string = mobile.replace(/^\+98/g, '');
    newMobile = newMobile.replace(/^98/g, '');
    newMobile = newMobile.replace(/^09/g, '9');
    return newMobile;
  }

  makeCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateLoginCode(
    user: User,
  ): Promise<{ code: string; uniqueKey: string }> {
    const isTest = process.env.NODE_ENV === 'test';
    let code: string = this.makeCode();
    if (isTest) code = '111111';
    let uniqueKey: string = uuidV4();
    while ((await this.keyvClient.get(code)) && !isTest) {
      code = this.makeCode();
    }
    while (await this.keyvClient.get(uniqueKey)) {
      uniqueKey = uuidV4();
    }
    await this.keyvClient.set(code, String(user.id), codeExpire);
    await this.keyvClient.set(uniqueKey, String(user.id), codeExpire);
    await this.keyvClient.set(user.phoneNumber, user.id, codeExpire);
    return { code, uniqueKey };
  }

  async geUserIdByVerifyCode(code: string, key: string): Promise<string> {
    const userId: string = await this.keyvClient.get(code);
    if (!userId) return null;
    const userId2: string = await this.keyvClient.get(key);
    if (!userId2) return null;
    if (userId !== userId2) return null;
    await this.keyvClient.delete(code);
    await this.keyvClient.delete(key);
    return userId;
  }

  async removeVerifyOpportunity(phoneNumber: string): Promise<void> {
    await this.keyvClient.delete(phoneNumber);
  }

  async checkUserInVerificationOpportunity(
    phoneNumber: string,
  ): Promise<boolean> {
    const exists = await this.keyvClient.get(phoneNumber);
    return Boolean(exists);
  }

  async clearKeyValueTable(): Promise<void> {
    await this.keyvClient.clear();
  }
}

export default new Utils();
