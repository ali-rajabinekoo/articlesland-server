import axios, { Axios } from 'axios';
import { mellipayamak } from './config';
import { MellipayamakResponse } from './schemas';

class Request {
  private connection: Axios;
  constructor() {
    this.makeNewConnection();
  }

  makeNewConnection(): void {
    this.connection = axios.create();
  }

  async sendSms(to: string, args: string[]): Promise<MellipayamakResponse> {
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
