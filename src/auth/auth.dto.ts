import { User } from '../user/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UserResDto } from '../user/user.dto';

export class AuthLoginDto {
  @ApiProperty({ type: User })
  user: UserResDto;

  @ApiProperty({ type: String, description: 'jwt token' })
  token: string;
}

export class KeyResponseDto {
  @ApiProperty({
    default: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    description: 'Verification key',
    maxLength: 36,
    minLength: 36,
  })
  key: string;
}

export class UnauthorizedDto {
  @ApiProperty({ type: Number, default: 401 })
  statusCode: number;

  @ApiProperty({ type: String, default: 'Unauthorized' })
  message: string;
}

export interface payloadType {
  id: number;
  iat?: number;
  exp?: number;
}
