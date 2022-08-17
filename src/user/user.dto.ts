import { IsMobilePhone, IsNotEmpty } from 'class-validator';
import { Exclude } from 'class-transformer';
import { validationMessages } from '../libs/messages';
import { User } from './user.entity';

export class UserJwtDto {
  id: number;

  password: string;
}

export class UserUniqueInfoDto {
  username: string;
  phoneNumber: string;
}

export class RegisterNewUserDto {
  @IsNotEmpty({ message: validationMessages.empty.username })
  username: string;

  @IsNotEmpty({ message: validationMessages.empty.phoneNumber })
  @IsMobilePhone(
    'fa-IR',
    {},
    { message: validationMessages.invalid.phoneNumber },
  )
  phoneNumber: string;

  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ message: validationMessages.empty.password })
  password: string;

  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ message: validationMessages.empty.repeatPassword })
  repeatPassword: string;
}

export class LoginByCredentialDto {
  @IsNotEmpty({ message: validationMessages.empty.username })
  username: string;

  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ message: validationMessages.empty.password })
  password: string;
}

export class SendLoginCodeDto {
  @IsNotEmpty({ message: validationMessages.empty.phoneNumber })
  @IsMobilePhone(
    'fa-IR',
    {},
    { message: validationMessages.invalid.phoneNumber },
  )
  phoneNumber: string;
}

export class LoginByCodeDto {
  @IsNotEmpty({ message: validationMessages.empty.code })
  code: string;

  @IsNotEmpty()
  key: string;
}

export class SignupVerificationDto {
  @IsNotEmpty({ message: validationMessages.empty.code })
  code: string;

  @IsNotEmpty()
  key: string;
}

export class RequestFormat {
  user: User;
}
