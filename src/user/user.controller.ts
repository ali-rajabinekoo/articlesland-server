import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestFormat } from './user.dto';
import { User } from './user.entity';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('info')
  async getUserInformation(@Req() req: RequestFormat): Promise<User> {
    return req.user;
  }
}
