import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  ForbiddenException,
  HttpCode,
  NotAcceptableException,
  NotFoundException,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  VerificationCodeDto,
  LoginByCredentialDto,
  RegisterNewUserDto,
  SendLoginCodeDto,
  UserUniqueInfoDto,
} from '../user/user.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { exceptionMessages, validationMessages } from '../libs/messages';
import utils from '../libs/utils';
import { AuthLoginDto, KeyResponseDto } from './auth.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

@ApiTags('auth')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('register')
  @HttpCode(201)
  @ApiCreatedResponse({
    description: 'The user has been successfully registered.',
    type: KeyResponseDto,
  })
  @ApiBadRequestResponse({
    description: [
      'Empty inputs.',
      'Invalid password.',
      'Invalid phoneNumber.',
      'The password and its repetition are not the same.',
      'Username should contains english letters',
      'Username should be lower then equal 20 english letters',
      'Username should be greater then equal 4 english letters',
    ].join(' | '),
  })
  @ApiNotAcceptableResponse({ description: 'Wait until code expiration time.' })
  @ApiConflictResponse({ description: 'User already exists.' })
  async register(@Body() newUser: RegisterNewUserDto): Promise<KeyResponseDto> {
    if (newUser.password !== newUser.repeatPassword) {
      throw new BadRequestException(validationMessages.invalid.repeatPassword);
    }
    newUser.phoneNumber = utils.normalizePhoneNumber(newUser.phoneNumber);
    const codeExists: boolean = await utils.checkUserInVerificationOpportunity(
      newUser.phoneNumber,
    );
    if (codeExists) {
      throw new NotAcceptableException(exceptionMessages.notAcceptable.code);
    }
    const duplicatedUser: User = await this.userService.findUserByUniqueInfo(
      newUser as UserUniqueInfoDto,
    );
    let user: User;
    if (!duplicatedUser) {
      user = await this.userService.addNewUser(newUser);
    } else if (!duplicatedUser.activated) {
      duplicatedUser.username = newUser.username;
      duplicatedUser.password = await bcrypt.hash(newUser.password, 10);
      user = await this.userService.saveUser(duplicatedUser);
    } else {
      throw new ConflictException(exceptionMessages.exist.user);
    }
    const key: string = await this.authService.sendCode(user);
    return { key };
  }

  @Post('register/verify')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'The user has been successfully verified.',
    type: AuthLoginDto,
  })
  @ApiBadRequestResponse({
    description: [
      'Empty inputs.',
      'Invalid code length.',
      'Invalid key length.',
    ].join(' | '),
  })
  @ApiForbiddenResponse({ description: 'Invalid code or key.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async registerVerify(
    @Body() userInfo: VerificationCodeDto,
  ): Promise<AuthLoginDto> {
    const userId: string = await utils.getUserIdByVerifyCode(
      userInfo.code,
      userInfo.key,
    );
    if (!userId) {
      throw new ForbiddenException(exceptionMessages.invalid.code);
    }
    const user: User = await this.userService.findUserById(Number(userId));
    if (!user || !!user.activated) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    await utils.removeVerifyOpportunity(user.phoneNumber);
    await this.userService.verifyUser(user);
    return {
      user: await this.userService.findUserById(user.id),
      token: await this.authService.login(user),
    };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'The user has been successfully logged in.',
    type: AuthLoginDto,
  })
  @ApiBadRequestResponse({ description: 'Empty inputs.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async login(@Body() userInfo: LoginByCredentialDto): Promise<AuthLoginDto> {
    const user: User = await this.userService.findUserByCredential(userInfo);
    if (!user || !user.activated) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    return {
      user: await this.userService.findUserById(user.id),
      token: await this.authService.login(user),
    };
  }

  @Post('login/mobile/send')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'The login verification code has been successfully sent.',
    type: KeyResponseDto,
  })
  @ApiBadRequestResponse({
    description: ['Empty inputs.', 'Invalid phoneNumber.'].join(' | '),
  })
  @ApiNotAcceptableResponse({ description: 'Wait until code expiration time.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async loginByCode(
    @Body() userInfo: SendLoginCodeDto,
  ): Promise<KeyResponseDto> {
    const codeExists: boolean = await utils.checkUserInVerificationOpportunity(
      utils.normalizePhoneNumber(userInfo.phoneNumber),
    );
    if (codeExists) {
      throw new NotAcceptableException(exceptionMessages.notAcceptable.code);
    }
    const user: User = await this.userService.findUserByPhoneNumber(userInfo);
    if (!user || !user.activated) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    const key: string = await this.authService.sendCode(user);
    return { key };
  }

  @Post('login/mobile/check')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'The user has been successfully logged in.',
    type: AuthLoginDto,
  })
  @ApiBadRequestResponse({
    description: [
      'Empty inputs.',
      'Invalid code length.',
      'Invalid key length.',
    ].join(' | '),
  })
  @ApiForbiddenResponse({ description: 'Invalid code or key.' })
  // @ApiNotFoundResponse({ description: 'User not found.' })
  async loginByCodeChecker(
    @Body() userInfo: VerificationCodeDto,
  ): Promise<AuthLoginDto> {
    const userId: string = await utils.getUserIdByVerifyCode(
      userInfo.code,
      userInfo.key,
    );
    if (!userId) {
      throw new ForbiddenException(exceptionMessages.invalid.code);
    }
    const user: User = await this.userService.findUserById(Number(userId));
    if (!user || !user.activated) {
      throw new NotFoundException(exceptionMessages.notFound.user);
    }
    await utils.removeVerifyOpportunity(user.phoneNumber);
    return {
      user: await this.userService.findUserById(user.id),
      token: await this.authService.login(user),
    };
  }
}
