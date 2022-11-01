import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { jwtConfig } from '../libs/config';
import { UserJwtDto } from '../user/user.dto';
import { User } from '../user/user.entity';
import { exceptionMessages } from '../libs/messages';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: UserJwtDto): Promise<any> {
    const user: User = await this.userService.findUserById(payload.id);
    if (!user || !user.activated) {
      throw new UnauthorizedException(exceptionMessages.invalid.jwt);
    }
    return user;
  }
}
