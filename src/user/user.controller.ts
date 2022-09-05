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
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  RequestFormat,
  SendEmailVerificationCodeDto,
  SendLoginCodeDto,
  UpdateUserInfo,
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

@Controller('user')
@ApiBearerAuth()
@ApiTags('user')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({ description: 'Unauthorized', type: UnauthorizedDto })
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiOkResponse({
    description: 'Returns user info.',
    type: User,
  })
  async getUserInformation(@Req() req: RequestFormat): Promise<User> {
    return this.userService.findUserById(req.user.id);
  }

  @Patch('email/send')
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
    const code: string = await utils.generateEmailCode(req.user, body.email);
    const username: string = req.user.displayName || req.user.username;
    const template: string = generateTemplate(username, code);
    const mailOptions: NodemailerOptionsDto = new NodemailerOptionsDto();
    mailOptions.html = template;
    mailOptions.to = body.email;
    await utils.sendEmail(mailOptions);
  }

  @Patch('email/verify')
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
  ): Promise<User> {
    const { userId, emailAddress }: { userId: string; emailAddress: string } =
      await utils.getUserInfoByCode(body.code);
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
    return this.userService.saveUser(user);
  }

  @Patch('mobile/send')
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
    userInfo.phoneNumber = utils.normalizePhoneNumber(userInfo.phoneNumber);
    const duplicatedUser: User = await this.userService.findUserByPhoneNumber(
      userInfo,
    );
    if (!!duplicatedUser) {
      if (duplicatedUser.phoneNumber === req.user.phoneNumber) {
        throw new ConflictException(exceptionMessages.exist.sameMobile);
      }
      throw new NotAcceptableException(exceptionMessages.exist.mobile);
    }
    const codeExists: boolean = await utils.checkUserInVerificationOpportunity(
      utils.normalizePhoneNumber(userInfo.phoneNumber),
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
  ): Promise<User> {
    const { userId, mobile }: { userId: string; mobile: string } =
      await utils.getUserInfoByMobileVerifyCode(userInfo.code);
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
    user.phoneNumber = utils.normalizePhoneNumber(mobile);
    return this.userService.saveUser(user);
  }

  @Patch('avatar')
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
  ): Promise<User> {
    if (!file) {
      throw new BadRequestException(validationMessages.empty.avatar);
    }
    const url: string = file.path.replace('public', '/statics');
    const user: User = req.user;
    user.avatar = url;
    return await this.userService.saveUser(user);
  }

  @Put()
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
  ): Promise<User> {
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
    return this.userService.saveUser(user);
  }
}
