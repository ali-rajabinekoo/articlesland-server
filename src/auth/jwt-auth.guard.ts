import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError } from 'jsonwebtoken';
import { exceptionMessages } from '../libs/messages';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  role: 'admin' | 'user' = 'user';

  constructor(defaultRole: 'admin' | 'user' | undefined | null) {
    super();
    if (!!defaultRole) this.role = defaultRole;
  }

  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException(exceptionMessages.invalid.jwt);
    }

    if (this.role === 'admin') {
      if (!user?.role || user.role !== 'admin') {
        throw new ForbiddenException(exceptionMessages.permission.section);
      }
    }

    return super.handleRequest(err, user, info, context, status);
  }
}
