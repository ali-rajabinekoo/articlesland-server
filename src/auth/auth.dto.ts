import { User } from '../user/user.entity';

export class AuthLoginDto {
  user: User;
  token: string;
}
