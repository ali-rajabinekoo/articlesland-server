import {
  BadRequestException,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../user.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { User } from '../user.entity';
import { exceptionMessages, validationMessages } from '../../libs/messages';
import utils from '../../libs/utils';
import { UserResDtoForAdmin } from '../user.dto';
import { getUsersLimit } from '../../libs/config';
import { AdminService } from './admin.service';
import { ILike, Not } from 'typeorm';

@Controller('admin')
@ApiTags('admin')
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
@UseGuards(new JwtAuthGuard('admin'))
export class AdminController {
  constructor(
    private userService: UserService,
    private adminService: AdminService,
  ) {}

  @Get('/users')
  @ApiOkResponse({
    description: 'Returns users information.',
    type: [User],
  })
  async getAllUsers(
    @Query('keyword') keyword?: string | undefined,
    @Query('status') status?: string | undefined,
    @Query('page') page?: number | undefined,
  ): Promise<{
    users: UserResDtoForAdmin[];
    total: number;
    totalPages: number;
  }> {
    if (!!status && status !== 'blocked' && status !== 'notBlocked') {
      throw new BadRequestException(validationMessages.invalid.statusFilter);
    }
    const [_users, total] = await this.userService.findUsers(
      keyword,
      isNaN(Number(page)) ? 1 : Number(page),
      { role: Not('admin') },
      [
        { phoneNumber: ILike(`%${keyword}%`) },
        { email: ILike(`%${keyword}%`) },
      ],
    );
    const users: UserResDtoForAdmin[] = (await this.adminService.syncIsBlocked(
      _users,
      !!status ? status === 'blocked' : undefined,
    )) as UserResDtoForAdmin[];
    return {
      users,
      total,
      totalPages: Math.ceil(total / getUsersLimit),
    };
  }

  @Post('block/:userId')
  async blockUser(@Param('userId') userId: number): Promise<void> {
    const user: User = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    await utils.admin.blockUser(userId);
  }

  @Post('unblock/:userId')
  async unblockUser(@Param('userId') userId: number): Promise<void> {
    const user: User = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    await utils.admin.unblockUser(userId);
  }

  @Delete(':userId')
  async removeUserAccount(@Param('userId') userId: number): Promise<void> {
    const user: User = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    await this.userService.removeUser(user);
  }
}
