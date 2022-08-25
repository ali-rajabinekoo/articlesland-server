import {
  IsMobilePhone,
  IsNotEmpty,
  Length,
  MaxLength,
  MinLength,
  Matches, IsAlpha, IsEmail,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import { validationMessages } from '../libs/messages';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserJwtDto {
  id: number;

  password: string;
}

export class UserUniqueInfoDto {
  username: string;
  phoneNumber: string;
}

export class RegisterNewUserDto {
  @ApiProperty({ default: 'articlesLandUser', description: 'Username' })
  @IsNotEmpty({ message: validationMessages.empty.username })
  @MinLength(4, { message: validationMessages.length.usernameShort })
  @MaxLength(20, { message: validationMessages.length.usernameLong })
  @IsAlpha('en-US', { message: validationMessages.invalid.username })
  username: string;

  @ApiProperty({
    default: '+989212210982',
    description: 'Valid Iran mobile number',
    examples: ['09212210982', '9212210982', '+989212210982'],
  })
  @IsNotEmpty({ message: validationMessages.empty.phoneNumber })
  @IsMobilePhone(
    'fa-IR',
    {},
    { message: validationMessages.invalid.phoneNumber },
  )
  phoneNumber: string;

  @ApiProperty({
    default: '123!@#AAAaaa',
    description: 'Password',
    minLength: 8,
    examples: [
      'lowercase letter',
      'uppercase letter',
      'special character',
      'number',
    ],
  })
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ message: validationMessages.empty.password })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/g, {
    message: validationMessages.invalid.password,
  })
  password: string;

  @ApiProperty({ default: '123!@#AAAaaa', description: 'Repeat password' })
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ message: validationMessages.empty.repeatPassword })
  repeatPassword: string;
}

export class LoginByCredentialDto {
  @ApiProperty({ default: 'articlesLandUser', description: 'Username' })
  @IsNotEmpty({ message: validationMessages.empty.username })
  username: string;

  @ApiProperty({
    default: '123!@#AAAaaa',
    description: 'Password',
    minLength: 8,
    examples: [
      'lowercase letter',
      'uppercase letter',
      'special character',
      'number',
    ],
  })
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ message: validationMessages.empty.password })
  password: string;
}

export class SendLoginCodeDto {
  @ApiProperty({
    default: '+989212210982',
    description: 'Valid Iran mobile number',
    examples: ['09212210982', '9212210982', '+989212210982'],
  })
  @IsNotEmpty({ message: validationMessages.empty.phoneNumber })
  @IsMobilePhone(
    'fa-IR',
    {},
    { message: validationMessages.invalid.phoneNumber },
  )
  phoneNumber: string;
}

export class VerificationCodeDto {
  @ApiProperty({
    default: '123456',
    maxLength: 6,
    minLength: 6,
    description: 'Verification code',
  })
  @Length(6)
  @IsNotEmpty({ message: validationMessages.empty.code })
  code: string;

  @ApiProperty({
    default: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    description: 'Verification key',
    maxLength: 36,
    minLength: 36,
  })
  @Length(36)
  @IsNotEmpty()
  key: string;
}

export class RequestFormat {
  user: User;
}

export class SendEmailVerificationCodeDto {
  @ApiProperty({
    default: 'ali.rajabinekoo@protonmail.com',
    description: 'Valid email address',
  })
  @IsNotEmpty({ message: validationMessages.empty.phoneNumber })
  @IsEmail({}, { message: validationMessages.invalid.phoneNumber })
  email: string;
}

export class VerifyByCodeDto {
  @ApiProperty({
    default: '123456',
    maxLength: 6,
    minLength: 6,
    description: 'Verification code',
  })
  @Length(6)
  @IsNotEmpty({ message: validationMessages.empty.code })
  code: string;
}

export class UpdateUserInfo {
  @ApiProperty({ default: 'articlesLandUser', description: 'Username' })
  @IsNotEmpty({ message: validationMessages.empty.username })
  @MinLength(4, { message: validationMessages.length.usernameShort })
  @MaxLength(20, { message: validationMessages.length.usernameLong })
  @IsAlpha('en-US', { message: validationMessages.invalid.username })
  username: string;

  @ApiProperty({
    default: '123!@#AAAaaa',
    description: 'Password',
    minLength: 8,
    examples: [
      'lowercase letter',
      'uppercase letter',
      'special character',
      'number',
    ],
  })
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ message: validationMessages.empty.password })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/g, {
    message: validationMessages.invalid.password,
  })
  password: string;

  @ApiProperty({ default: '123!@#AAAaaa', description: 'Repeat password' })
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ message: validationMessages.empty.repeatPassword })
  repeatPassword: string;

  @ApiProperty({ default: 'ArticlesLand User', description: 'Display name' })
  @IsNotEmpty({ message: validationMessages.empty.username })
  @MinLength(4, { message: validationMessages.length.usernameShort })
  @MaxLength(20, { message: validationMessages.length.usernameLong })
  displayName: string;

  @ApiProperty({ default: 'This is ArticlesLand User', description: 'Bio' })
  @IsNotEmpty({ message: validationMessages.empty.username })
  @MinLength(4, { message: validationMessages.length.usernameShort })
  @MaxLength(100, { message: validationMessages.length.usernameLong })
  bio: string;
}
