import axios, { Axios } from 'axios';
import { mellipayamak } from './config';
import { MellipayamakResponse } from './schemas';

class Request {
  private connection: Axios;
  private isTest = process.env.NODE_ENV === 'test';

  constructor() {
    this.makeNewConnection();
  }

  makeNewConnection(): void {
    this.connection = axios.create();
  }

  async sendSms(to: string, args: string[]): Promise<MellipayamakResponse> {
    if (this.isTest) {
      const response = new MellipayamakResponse();
      response.Value = '123456789123456789123456789';
      response.StrRetStatus = 'Ok';
      response.RetStatus = 1;
      return response;
    }
    const response = await this.connection.post(mellipayamak.url, {
      username: mellipayamak.username,
      password: mellipayamak.password,
      text: args.join(';'),
      to,
      bodyId: mellipayamak.authBodyId,
    });
    return response.data as MellipayamakResponse;
  }
}

export default new Request();
