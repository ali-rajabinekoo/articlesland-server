import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import utils from '../libs/utils';
import request from '../libs/request';
import { MellipayamakResponse } from '../libs/schemas';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: User): Promise<string> {
    const payload = { username: user.username, id: user.id };
    return this.jwtService.sign(payload);
  }

  async sendLoginCode(user: User): Promise<string> {
    const { code, uniqueKey } = await utils.generateLoginCode(user);
    const { Value }: MellipayamakResponse = await request.sendSms(
      user.phoneNumber,
      [code],
    );
    return Value.length >= 15 ? uniqueKey : null;
  }
}
