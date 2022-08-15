import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginByCodeDto,
  LoginByCredentialDto,
  RegisterNewUserDto,
  SendLoginCodeDto,
  UserUniqueInfoDto,
} from '../user/user.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { exceptionMessages, validationMessages } from '../libs/messages';
import utils from '../libs/utils';
import { AuthLoginDto } from './auth.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @HttpCode(201)
  @Post('register')
  async register(@Body() newUser: RegisterNewUserDto): Promise<AuthLoginDto> {
    if (!utils.isValidPassword(newUser.password)) {
      throw new BadRequestException(validationMessages.invalid.password);
    }
    if (newUser.password !== newUser.repeatPassword) {
      throw new BadRequestException(validationMessages.invalid.repeatPassword);
    }
    newUser.phoneNumber = utils.normalizePhoneNumber(newUser.phoneNumber);
    const duplicatedUser: User = await this.userService.findUserByUniqueInfo(
      newUser as UserUniqueInfoDto,
    );
    if (!!duplicatedUser) {
      throw new ConflictException(exceptionMessages.exist.user);
    }
    const user: User = await this.userService.addNewUser(newUser);
    return {
      user,
      token: await this.authService.login(user),
    };
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() userInfo: LoginByCredentialDto): Promise<AuthLoginDto> {
    const user: User = await this.userService.findUserByCredential(userInfo);
    if (!user) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    return {
      user,
      token: await this.authService.login(user),
    };
  }

  @HttpCode(200)
  @Post('login/mobile/send')
  async loginByCode(
    @Body() userInfo: SendLoginCodeDto,
  ): Promise<{ key: string }> {
    const user: User = await this.userService.findUserByPhoneNumber(userInfo);
    if (!user) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    const key: string = await this.authService.sendLoginCode(user);
    return { key };
  }

  @HttpCode(200)
  @Post('login/mobile/check')
  async loginByCodeChecker(
    @Body() userInfo: LoginByCodeDto,
  ): Promise<AuthLoginDto> {
    const userId: string = await utils.geUserIdByLoginCode(
      userInfo.code,
      userInfo.key,
    );
    if (!userId) {
      throw new ForbiddenException(exceptionMessages.forbidden.user);
    }
    const user: User = await this.userService.findUserById(Number(userId));
    if (!user) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    return {
      user,
      token: await this.authService.login(user),
    };
  }
}
