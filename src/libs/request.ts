import { Injectable } from '@nestjs/common';
import { Axios } from 'axios';
import { mellipayamak } from './config';
import { MellipayamakResponse } from './schemes';

@Injectable()
export class Request {
  private connection: Axios;
  constructor() {
    this.makeNewConnection();
  }

  makeNewConnection(): void {
    this.connection = new Axios();
  }

  async sendSms(to: string, args: string[]): Promise<MellipayamakResponse> {
    return this.connection.post(mellipayamak.url, {
      username: mellipayamak.username,
      password: mellipayamak.password,
      text: args.join(';'),
      to,
      bodyId: mellipayamak.authBodyId,
    });
  }
}
