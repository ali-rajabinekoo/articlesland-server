import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '../libs/config';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmTestingModule } from '../app.module.test';
import { User } from '../user/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  const user: User = new User();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: jwtConfig.secret,
          signOptions: { expiresIn: jwtConfig.expireAt },
        }),
        PassportModule,
        UserModule,
        ...TypeOrmTestingModule(),
      ],
      controllers: [AuthController],
      providers: [AuthService, JwtStrategy],
    }).compile();

    service = module.get<AuthService>(AuthService);
    user.id = 1;
    user.username = 'test';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should login method returns verified jwt token string', async () => {
    const matched = new RegExp(/^eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/g);
    expect(await service.login(user)).toMatch(matched);
  });
});
