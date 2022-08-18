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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UnauthorizedDto } from '../auth/auth.dto';

@Controller('user')
@ApiBearerAuth()
@ApiTags('user')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({ description: 'Unauthorized', type: UnauthorizedDto })
export class UserController {
  constructor(private userService: UserService) {}

  @Get('info')
  @ApiOkResponse({
    description: 'Returns user info.',
    type: User,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns user info.',
  })
  async getUserInformation(@Req() req: RequestFormat): Promise<User> {
    return this.userService.findUserById(req.user.id);
  }
}
