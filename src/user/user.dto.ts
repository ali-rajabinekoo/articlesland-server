import {
  IsMobilePhone,
  IsNotEmpty,
  Length,
  MaxLength,
  MinLength,
  Matches,
  IsEmail,
  IsAlphanumeric,
  IsOptional,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import { validationMessages } from '../libs/messages';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ArticleResDto } from '../article/article.dto';
import { Relation } from 'typeorm';
import { Comment } from '../comment/comment.entity';

export class UserJwtDto {
  id: number;

  password: string;
}

export class UserUniqueInfoDto {
  username: string;
  phoneNumber: string;
}

export class CreateUserQuery {
  username: string;
  phoneNumber: string;
  password: string;
  displayName?: string;
}

export class RegisterNewUserDto {
  @ApiProperty({ default: 'articlesLandUser', description: 'Username' })
  @IsNotEmpty({ message: validationMessages.empty.username })
  @MinLength(4, { message: validationMessages.length.usernameShort })
  @MaxLength(20, { message: validationMessages.length.usernameLong })
  @IsAlphanumeric('en-US', { message: validationMessages.invalid.username })
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
    default: '1379rajabi',
    description: 'Password',
    minLength: 8,
    examples: ['lowercase or uppercase letter', 'number'],
  })
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ message: validationMessages.empty.password })
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.{8,})/g, {
    message: validationMessages.invalid.password,
  })
  password: string;

  @ApiProperty({ default: '1379rajabi', description: 'Repeat password' })
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ message: validationMessages.empty.repeatPassword })
  repeatPassword: string;
}

export class LoginByRefreshTokenDto {
  @ApiProperty({
    default: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...',
    description: 'RefreshToken',
  })
  @IsNotEmpty({ message: validationMessages.empty.refreshToken })
  refreshToken: string;
}

export class LoginByCredentialDto {
  @ApiProperty({ default: 'articlesLandUser', description: 'Username' })
  @IsNotEmpty({ message: validationMessages.empty.username })
  username: string;

  @ApiProperty({
    default: '1379rajabi',
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
  @IsNotEmpty({ message: validationMessages.empty.email })
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
  @MinLength(4, { message: validationMessages.length.usernameShort })
  @MaxLength(20, { message: validationMessages.length.usernameLong })
  @IsAlphanumeric('en-US', { message: validationMessages.invalid.username })
  @IsOptional()
  username?: string | undefined;

  @ApiProperty({
    default: '1379rajabi',
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
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.{8,})/g, {
    message: validationMessages.invalid.password,
  })
  @IsOptional()
  password?: string | undefined;

  @ApiProperty({ default: '1379rajabi', description: 'Repeat password' })
  @Exclude({ toPlainOnly: true })
  @IsOptional()
  repeatPassword?: string | undefined;

  @ApiProperty({ default: 'ArticlesLand User', description: 'Display name' })
  @MinLength(4, { message: validationMessages.length.displayNameShort })
  @MaxLength(50, { message: validationMessages.length.displayNameLong })
  @IsOptional()
  displayName?: string | undefined;

  @ApiProperty({ default: 'This is ArticlesLand User', description: 'Bio' })
  @MinLength(4, { message: validationMessages.length.bioShort })
  @MaxLength(150, { message: validationMessages.length.bioLong })
  @IsOptional()
  bio?: string | undefined;
}

export class FollowDto {
  @ApiProperty({
    default: '1',
    description: 'Following user id.',
  })
  @IsNotEmpty({ message: validationMessages.empty.follow })
  newFollowingUserId: number;
}

// Response Serialization DTOs

export class UserResDto {
  articles: ArticleResDto[];
  likes: ArticleResDto[];
  bookmarks: ArticleResDto[];
  followers: UserResDto[];
  followings: UserResDto[];

  @Exclude({ toPlainOnly: true })
  password: string;
  @Exclude({ toPlainOnly: true })
  activated: boolean;
  @Exclude({ toPlainOnly: true })
  comments: Relation<Comment[]>;

  constructor(
    partial: Partial<User>,
    options?: {
      protectedUser?: boolean;
      showRefreshToken?: boolean;
      authenticationResponse?: boolean;
    },
  ) {
    if (!!options?.protectedUser) {
      const validFields = ['id', 'username', 'displayName', 'avatar', 'bio'];
      if (!!options?.showRefreshToken) validFields.push('refreshToken');
      for (const partialKey in partial) {
        if (!validFields.includes(partialKey)) {
          delete partial[partialKey];
        }
      }
    } else if (!options?.showRefreshToken) {
      delete partial.refreshToken;
    }
    if (!!options?.authenticationResponse) {
      const validFields = [
        'id',
        'username',
        'displayName',
        'phoneNumber',
        'email',
        'avatar',
        'bio',
        'refreshToken',
        'created_at',
        'updated_at',
      ];
      for (const partialKey in partial) {
        if (!validFields.includes(partialKey)) {
          delete partial[partialKey];
        }
      }
    } else {
      if (Array.isArray(partial?.bookmarks) && partial.bookmarks.length !== 0) {
        this.bookmarks = partial.bookmarks.map((el) => new ArticleResDto(el));
      }
      if (Array.isArray(partial?.likes) && partial.likes.length !== 0) {
        this.likes = partial.likes.map((el) => new ArticleResDto(el));
      }
      if (Array.isArray(partial?.articles) && partial.articles.length !== 0) {
        this.articles = partial.articles.map((el) => new ArticleResDto(el));
      }
      if (Array.isArray(partial?.followers) && partial.followers.length !== 0) {
        this.followers = partial.followers.map(
          (el) =>
            new UserResDto(el, {
              protectedUser: true,
            }),
        );
      }
      if (
        Array.isArray(partial?.followings) &&
        partial.followings.length !== 0
      ) {
        this.followings = partial.followings.map(
          (el) =>
            new UserResDto(el, {
              protectedUser: true,
            }),
        );
      }
    }
    Object.assign(this, partial);
  }
}
