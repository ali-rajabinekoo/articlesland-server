import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import utils from '../libs/utils';
import request from '../libs/request';
import { MellipayamakResponse } from '../libs/schemas';
import { payloadType } from './auth.dto';
import { exceptionMessages } from '../libs/messages';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: User): Promise<string> {
    const payload: payloadType = { id: user.id };
    return this.jwtService.sign(payload);
  }

  async authorization(headers: any): Promise<number> {
    try {
      const token = headers?.authorization
        ?.replace('Bearer ', '')
        ?.replace('bearer ', '');
      if (!!token) {
        const data: payloadType = (await this.jwtService.decode(
          token,
        )) as payloadType;
        if (data.exp > Date.now()) {
          (() => {
            throw new UnauthorizedException(exceptionMessages.invalid.jwt);
          })();
        }
        if (!!data?.id) {
          return data.id;
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  async sendCode(user: User): Promise<string> {
    const { code, uniqueKey } = await utils.verification.generateLoginCode(
      user,
    );
    const { Value }: MellipayamakResponse = await request.sendSms(
      user.phoneNumber,
      [code],
    );
    return Value.length >= 15 ? uniqueKey : null;
  }
}
