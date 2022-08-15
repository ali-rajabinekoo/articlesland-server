import { User } from '../user/user.entity';
import * as Keyv from 'keyv';
import { v4 as uuidV4 } from 'uuid';
import { database } from './config';

class Utils {
  private passRegex = new RegExp(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})',
  );
  private keyvClient = new Keyv(
    process.env.NODE_ENV === 'test' ? database.keyvTest : database.keyv,
  );

  normalizePhoneNumber(mobile: string): string {
    let newMobile: string = mobile.replace(/^\+98/g, '');
    newMobile = newMobile.replace(/^98/g, '');
    newMobile = newMobile.replace(/^09/g, '9');
    return newMobile;
  }

  isValidPassword(password: string): boolean {
    return this.passRegex.test(password);
  }

  async generateLoginCode(
    user: User,
  ): Promise<{ code: string; uniqueKey: string }> {
    const isTest = process.env.NODE_ENV === 'test';
    let code: string = Math.floor(100000 + Math.random() * 900000).toString();
    if (isTest) code = '123456789';
    let uniqueKey: string = uuidV4();
    while ((await this.keyvClient.get(code)) && !isTest) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    }
    while (await this.keyvClient.get(uniqueKey)) {
      uniqueKey = uuidV4();
    }
    await this.keyvClient.set(code, String(user.id), 1000 * 90);
    await this.keyvClient.set(uniqueKey, String(user.id), 1000 * 90);
    await this.keyvClient.set(user.phoneNumber, user.id, 1000 * 90);
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
