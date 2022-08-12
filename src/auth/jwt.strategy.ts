import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { jwtConfig } from '../libs/config';
import { UserJwtDto } from '../user/user.dto';

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
    // const user: User = await this.userService.findUserById(payload.id);
    // if (!user) throw new UnauthorizedException();
    return payload;
  }
}
