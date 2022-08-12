import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterNewUserDto, UserUniqueInfoDto } from '../user/user.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { exceptionMessages, validationMessages } from '../libs/messages';
import utils from '../libs/utils';
import { AuthLoginDto } from './auth.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  private passRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})');

  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @HttpCode(201)
  @Post('register')
  async register(@Body() newUser: RegisterNewUserDto): Promise<AuthLoginDto> {
    if (!this.passRegex.test(newUser.password)) {
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
}
