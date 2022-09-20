import * as Keyv from 'keyv';
import {
  codeExpire,
  database,
  emailCodeExpire,
  nodemailerConfig,
} from '../config';
import { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as nodemailer from 'nodemailer';
import { User } from '../../user/user.entity';
import { NodemailerOptionsDto } from '../schemas';
import { v4 as uuidV4 } from 'uuid';

export class Verification {
  private keyValueClient = new Keyv(
    process.env.NODE_ENV === 'test' ? database.keyvTest : database.keyv,
    { namespace: 'verification' },
  );
  private nodeMailerTransport: Transporter<SMTPTransport.SentMessageInfo>;

  constructor() {
    const options: any = {
      auth: {
        user: nodemailerConfig.username,
        pass: nodemailerConfig.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
      host: nodemailerConfig.host,
      port: nodemailerConfig.port,
      secure: nodemailerConfig.secure,
    };
    this.nodeMailerTransport = nodemailer.createTransport(options);
  }

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
    while ((await this.keyValueClient.get(code)) && !isTest) {
      code = this.makeCode();
    }
    while (await this.keyValueClient.get(uniqueKey)) {
      uniqueKey = uuidV4();
    }
    await this.keyValueClient.set(code, String(user.id), codeExpire);
    await this.keyValueClient.set(uniqueKey, String(user.id), codeExpire);
    await this.keyValueClient.set(user.phoneNumber, user.id, codeExpire);
    return { code, uniqueKey };
  }

  async getUserIdByVerifyCode(code: string, key: string): Promise<string> {
    const userId: string = await this.keyValueClient.get(code);
    if (!userId) return null;
    const userId2: string = await this.keyValueClient.get(key);
    if (!userId2) return null;
    if (userId !== userId2) return null;
    await this.keyValueClient.delete(code);
    await this.keyValueClient.delete(key);
    return userId;
  }

  async generateUpdateMobileCode(user: User): Promise<{ code: string }> {
    const isTest = process.env.NODE_ENV === 'test';
    let code: string = this.makeCode();
    if (isTest) code = '111111';
    while ((await this.keyValueClient.get(code)) && !isTest) {
      code = this.makeCode();
    }
    await this.keyValueClient.set(code, String(user.id), codeExpire);
    await this.keyValueClient.set(
      `mobile-${user.id}`,
      user.phoneNumber,
      codeExpire,
    );
    await this.keyValueClient.set(user.phoneNumber, user.id, codeExpire);
    return { code };
  }

  async getUserInfoByMobileVerifyCode(
    code: string,
  ): Promise<{ userId: string; mobile: string }> {
    const userId: string = await this.keyValueClient.get(code);
    const mobile: string = await this.keyValueClient.get(`mobile-${userId}`);
    await this.keyValueClient.delete(code);
    await this.keyValueClient.delete(`mobile-${userId}`);
    await this.keyValueClient.delete(mobile);
    return { userId, mobile };
  }

  async removeVerifyOpportunity(phoneNumber: string): Promise<void> {
    await this.keyValueClient.delete(phoneNumber);
  }

  async checkUserInVerificationOpportunity(
    phoneNumber: string,
  ): Promise<boolean> {
    const exists = await this.keyValueClient.get(phoneNumber);
    return Boolean(exists);
  }

  async clearKeyValueTable(): Promise<void> {
    await this.keyValueClient.clear();
  }

  async generateEmailCode(user: User, email: string): Promise<string> {
    const isTest = process.env.NODE_ENV === 'test';
    let code: string = this.makeCode();
    if (isTest) code = '111111';
    while (await this.keyValueClient.get(code)) {
      code = this.makeCode();
    }
    await this.keyValueClient.set(code, String(user.id), emailCodeExpire);
    await this.keyValueClient.set(`email-${user.id}`, email, emailCodeExpire);
    return code;
  }

  async getUserInfoByCode(
    code: string,
  ): Promise<{ userId: string; emailAddress: string }> {
    const userId: string = await this.keyValueClient.get(code);
    const emailAddress: string = await this.keyValueClient.get(
      `email-${userId}`,
    );
    await this.keyValueClient.delete(code);
    await this.keyValueClient.delete(`email-${userId}`);
    return { userId, emailAddress };
  }

  async sendEmail(nodemailerOptions: NodemailerOptionsDto): Promise<void> {
    if (process.env.NODE_ENV === 'test') return null;
    await this.nodeMailerTransport.sendMail(nodemailerOptions);
  }
}
