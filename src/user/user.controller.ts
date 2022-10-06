import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Req,
  UseGuards,
  UseInterceptors,
  Patch,
  Body,
  Put,
  ForbiddenException,
  NotAcceptableException,
  InternalServerErrorException,
  ConflictException,
  UploadedFile,
  BadRequestException,
  Post,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  RequestFormat,
  SendEmailVerificationCodeDto,
  SendLoginCodeDto,
  UpdateUserInfo,
  UserResDto,
  VerifyByCodeDto,
} from './user.dto';
import { User } from './user.entity';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotAcceptableResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UnauthorizedDto } from '../auth/auth.dto';
import utils from '../libs/utils';
import { generateTemplate } from '../libs/email.template';
import { NodemailerOptionsDto } from '../libs/schemas';
import { exceptionMessages, validationMessages } from '../libs/messages';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  imageFileFilter,
  imageSize,
  avatarStorage,
} from '../libs/file-uploading.utils';
import * as bcrypt from 'bcrypt';
import { getUsersLimit } from '../libs/config';
import { NotificationService } from '../notification/notification.service';

@Controller('user')
@ApiTags('user')
@UseInterceptors(ClassSerializerInterceptor)
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
export class UserController {
  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'Returns user info.',
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  async getUserInformation(@Req() req: RequestFormat): Promise<UserResDto> {
    return new UserResDto(
      await this.userService.findUserById(req.user.id, true),
    );
  }

  @Get('/list')
  @ApiOkResponse({
    description: 'Returns another user info by id.',
    type: User,
  })
  async getAllUsers(
    @Query('keyword') keyword?: string | undefined,
    @Query('page') page?: number | undefined,
  ): Promise<{ users: UserResDto[]; total: number; totalPages: number }> {
    const [users, total] = await this.userService.findUsers(
      keyword,
      isNaN(Number(page)) ? 1 : Number(page),
    );
    return { users, total, totalPages: Math.ceil(total / getUsersLimit) };
  }

  // @Get(':id')
  // @ApiOkResponse({
  //   description: 'Returns another user info by id.',
  //   type: User,
  // })
  // async getUserInformationById(@Param('id') id: string): Promise<User> {
  //   const user: User = await this.userService.findUserById(Number(id));
  //   delete user.phoneNumber;
  //   delete user.email;
  //   delete user.updated_at;
  //   delete user.created_at;
  //   delete user.refreshToken;
  //   delete user.bookmarks;
  //   delete user.comments;
  //   delete user.likes;
  //   delete user.reports;
  //   delete user.selectedCategories;
  //   return user;
  // }

  @Get(':username')
  @ApiOkResponse({
    description: 'Returns another user info by id.',
    type: User,
  })
  async getUserInformationById(
    @Param('username') username: string,
  ): Promise<UserResDto> {
    const user: User = await this.userService.findUserByUsername(username);
    user.articles = user.articles.filter((el) => el.published);
    return new UserResDto(user, {
      protectedUser: true,
      extraValidFields: ['articles', 'followers', 'followings'],
    });
  }

  @Patch('email/send')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiOkResponse({
    description: 'Email address verification code sent.',
  })
  @ApiConflictResponse({
    description: 'Email is submitted by this user.',
  })
  @ApiNotAcceptableResponse({
    description: 'Email is submitted by another user.',
  })
  async sendEmailVerificationCode(
    @Body() body: SendEmailVerificationCodeDto,
    @Req() req: RequestFormat,
  ): Promise<void> {
    const duplicatedUser: User = await this.userService.findUserByEmail(
      body.email,
    );
    if (!!duplicatedUser) {
      if (duplicatedUser.email === req.user.email) {
        throw new ConflictException(exceptionMessages.exist.sameEmail);
      }
      throw new NotAcceptableException(exceptionMessages.exist.email);
    }
    const code: string = await utils.verification.generateEmailCode(
      req.user,
      body.email,
    );
    const username: string = req.user.displayName || req.user.username;
    const template: string = generateTemplate(username, code);
    const mailOptions: NodemailerOptionsDto = new NodemailerOptionsDto();
    mailOptions.html = template;
    mailOptions.to = body.email;
    await utils.verification.sendEmail(mailOptions);
  }

  @Patch('email/verify')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiOkResponse({
    description: 'Email address verified.',
    type: User,
  })
  @ApiBadRequestResponse({
    description: ['Empty inputs.', 'Invalid code length.'].join(' | '),
  })
  @ApiForbiddenResponse({
    description: 'Invalid code.',
  })
  async verifyEmailByCode(
    @Body() body: VerifyByCodeDto,
    @Req() req: RequestFormat,
  ): Promise<UserResDto> {
    const { userId, emailAddress }: { userId: string; emailAddress: string } =
      await utils.verification.getUserInfoByCode(body.code);
    if (!userId || !emailAddress) {
      throw new ForbiddenException(exceptionMessages.invalid.code);
    }
    const user: User = await this.userService.findUserById(Number(userId));
    if (
      !user ||
      (!!user && user.id !== Number(userId)) ||
      (!!user && user.id !== req.user.id)
    ) {
      throw new ForbiddenException(exceptionMessages.invalid.code);
    }
    user.email = emailAddress;
    return new UserResDto(await this.userService.saveUser(user));
  }

  @Patch('mobile/send')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiOkResponse({
    description: 'Mobile verification code sent.',
  })
  @ApiConflictResponse({
    description: 'PhoneNumber is submitted by this user.',
  })
  @ApiNotAcceptableResponse({
    description: [
      'PhoneNumber is submitted by another user.',
      'Wait until code expiration time.',
    ].join(' | '),
  })
  async sendMobileVerificationCode(
    @Body() userInfo: SendLoginCodeDto,
    @Req() req: RequestFormat,
  ): Promise<void> {
    userInfo.phoneNumber = utils.verification.normalizePhoneNumber(
      userInfo.phoneNumber,
    );
    const duplicatedUser: User = await this.userService.findUserByPhoneNumber(
      userInfo,
    );
    if (!!duplicatedUser) {
      if (duplicatedUser.phoneNumber === req.user.phoneNumber) {
        throw new ConflictException(exceptionMessages.exist.sameMobile);
      }
      throw new NotAcceptableException(exceptionMessages.exist.mobile);
    }
    const codeExists: boolean =
      await utils.verification.checkUserInVerificationOpportunity(
        utils.verification.normalizePhoneNumber(userInfo.phoneNumber),
      );
    if (codeExists) {
      throw new NotAcceptableException(exceptionMessages.notAcceptable.code);
    }
    const user: User = req.user;
    user.phoneNumber = userInfo.phoneNumber;
    const isSuccess: boolean = await this.userService.sendCode(user);
    if (!isSuccess) {
      throw new InternalServerErrorException(
        exceptionMessages.serverError.internal,
      );
    }
  }

  @Patch('mobile/verify')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiOkResponse({
    description: 'Mobile code verified.',
    type: User,
  })
  @ApiBadRequestResponse({
    description: ['Empty inputs.', 'Invalid code length.'].join(' | '),
  })
  @ApiForbiddenResponse({
    description: 'Invalid code.',
  })
  async verifyMobileByCode(
    @Body() userInfo: VerifyByCodeDto,
    @Req() req: RequestFormat,
  ): Promise<UserResDto> {
    const { userId, mobile }: { userId: string; mobile: string } =
      await utils.verification.getUserInfoByMobileVerifyCode(userInfo.code);
    if (!userId || !mobile) {
      throw new ForbiddenException(exceptionMessages.invalid.code);
    }
    const user: User = await this.userService.findUserById(Number(userId));
    if (
      !user ||
      (!!user && user.id !== Number(userId)) ||
      (!!user && user.id !== req.user.id)
    ) {
      throw new ForbiddenException(exceptionMessages.invalid.code);
    }
    user.phoneNumber = utils.verification.normalizePhoneNumber(mobile);
    return new UserResDto(await this.userService.saveUser(user));
  }

  @Patch('avatar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: avatarStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: imageSize },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Avatar updated.',
    type: User,
  })
  @ApiBadRequestResponse({
    description: [
      'Avatar is empty.',
      'Avatar should be jpg, jpeg, png.',
      'Avatar size should be lower then 2mb.',
    ].join(' | '),
  })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestFormat,
  ): Promise<UserResDto> {
    if (!file) {
      throw new BadRequestException(validationMessages.empty.avatar);
    }
    const url: string = file.path.replace('public', '/statics');
    const user: User = req.user;
    user.avatar = url;
    return new UserResDto(await this.userService.saveUser(user));
  }

  @Put()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiOkResponse({
    description: 'Profile updated.',
    type: User,
  })
  @ApiBadRequestResponse({
    description: [
      'Empty inputs.',
      'Invalid password.',
      'Bio should be lower then equal 150 characters',
      'Bio should be greater then equal 4 characters',
      'The password and its repetition are not the same.',
      'Username should contains english letters and numbers',
      'DisplayName should be lower then equal 50 characters',
      'DisplayName should be greater then equal 4 characters',
      'Username should be lower then equal 20 english letters and numbers',
      'Username should be greater then equal 4 english letters and numbers',
    ].join(' | '),
  })
  async updateProfile(
    @Body() userInfo: UpdateUserInfo,
    @Req() req: RequestFormat,
  ): Promise<UserResDto> {
    if (!!userInfo.password && userInfo.password !== userInfo.repeatPassword) {
      throw new BadRequestException(validationMessages.invalid.repeatPassword);
    }
    const user: User = await this.userService.findUserById(req.user.id);
    if (!!userInfo.username) user.username = userInfo.username;
    if (!!userInfo.displayName) user.displayName = userInfo.displayName;
    if (!!userInfo.bio) user.bio = userInfo.bio;
    if (!!userInfo.password) {
      user.password = await bcrypt.hash(userInfo.password, 10);
    }
    return new UserResDto(await this.userService.saveUser(user));
  }

  @Post('follow/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiOkResponse({
    description: 'User followed.',
    type: User,
  })
  async follow(
    @Req() req: RequestFormat,
    @Param('id') userId: number,
  ): Promise<UserResDto> {
    if (!userId) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    const follower: User = req.user;
    const following: User = await this.userService.findUserById(userId);
    if (!following || following?.id === follower.id) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    if (!!following.blockedUsers?.find((el) => el.id === follower.id)) {
      throw new ForbiddenException(
        exceptionMessages.forbidden.youBlockedByUser,
      );
    }
    if (!!follower.blockedUsers?.find((el) => el.id === following.id)) {
      throw new ForbiddenException(
        exceptionMessages.forbidden.youBlockedThisUser,
      );
    }
    this.notificationService
      .newNotification({
        type: 'follow',
        creator: req.user,
        owner: following,
      })
      .catch();
    follower.followings.push(following);
    await this.userService.saveUser(follower);
    following.followers.push(follower);
    await this.userService.saveUser(following);
    return new UserResDto(await this.userService.findUserById(follower.id));
  }

  @Post('unfollow/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiOkResponse({
    description: 'User unfollowed.',
    type: User,
  })
  async unfollow(
    @Req() req: RequestFormat,
    @Param('id') userId: number,
  ): Promise<UserResDto> {
    if (!userId) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    const follower: User = req.user;
    const following: User = await this.userService.findUserById(userId);
    if (!following || following?.id === follower.id) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    follower.followings = follower.followings.filter((user: User) => {
      return user.id !== following.id;
    });
    await this.userService.saveUser(follower);
    following.followers = following.followers.filter((user: User) => {
      return user.id !== follower.id;
    });
    await this.userService.saveUser(following);
    return new UserResDto(await this.userService.findUserById(follower.id));
  }

  @Post('block/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiOkResponse({
    description: 'User blocked.',
    type: User,
  })
  async block(
    @Req() req: RequestFormat,
    @Param('id') userId: number,
  ): Promise<UserResDto> {
    if (!userId) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    const user: User = req.user;
    const targetUser: User = await this.userService.findUserById(userId);
    if (!targetUser || targetUser?.id === req.user?.id) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    user.blockedUsers.push(targetUser);
    user.likes = user.likes.filter((el) => el.owner.id !== targetUser.id);
    user.bookmarks = user.bookmarks.filter(
      (el) => el.owner.id !== targetUser.id,
    );
    user.followers = user.followers.filter((el) => el.id !== targetUser.id);
    user.followings = user.followings.filter((el) => el.id !== targetUser.id);
    await this.userService.saveUser(user);
    targetUser.likes = targetUser.likes.filter((el) => el.owner.id !== user.id);
    targetUser.bookmarks = targetUser.bookmarks.filter(
      (el) => el.owner.id !== user.id,
    );
    targetUser.followers = targetUser.followers.filter(
      (el) => el.id !== user.id,
    );
    targetUser.followings = targetUser.followings.filter(
      (el) => el.id !== user.id,
    );
    await this.userService.saveUser(targetUser);
    return new UserResDto(await this.userService.findUserById(user.id));
  }

  @Post('unblock/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiOkResponse({
    description: 'User unblocked.',
    type: User,
  })
  async unblock(
    @Req() req: RequestFormat,
    @Param('id') userId: number,
  ): Promise<UserResDto> {
    if (!userId) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    const user: User = req.user;
    const targetUser: User = await this.userService.findUserById(userId);
    if (!targetUser || targetUser?.id === req.user?.id) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    user.blockedUsers = user.blockedUsers.filter(
      (el) => el.id !== targetUser.id,
    );
    await this.userService.saveUser(user);
    return new UserResDto(await this.userService.findUserById(user.id));
  }
}
