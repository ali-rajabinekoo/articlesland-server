import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '../libs/config';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmTestingModule } from '../app.module.test';
import { RegisterNewUserDto } from '../user/user.dto';
import { User } from '../user/user.entity';
import utils from '../libs/utils';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthLoginDto } from './auth.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { exceptionMessages, validationMessages } from '../libs/messages';

describe('AuthController', () => {
  let controller: AuthController;
  let repository: Repository<User>;
  const newUser: RegisterNewUserDto = new RegisterNewUserDto();

  beforeAll(async () => {
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

    controller = module.get<AuthController>(AuthController);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    const user: User = await repository.findOneBy({
      username: newUser.username,
    });
    if (!!user) await repository.remove(user);
  });

  beforeEach(() => {
    newUser.username = 'test';
    newUser.password = 'Test1234@1';
    newUser.repeatPassword = 'Test1234@1';
    newUser.phoneNumber = '+989212210982';
  });

  it('should not add new user when password and repeatPassword are not same', async () => {
    try {
      const body: RegisterNewUserDto = { ...newUser };
      body.repeatPassword = '123';
      await controller.register(body);
    } catch (e) {
      expect(e instanceof BadRequestException).toEqual(true);
      expect(e.response).toMatchObject({
        statusCode: 400,
        message: validationMessages.invalid.repeatPassword,
        error: 'Bad Request',
      });
    }
  });

  it('should not add new user when password is weak', async () => {
    const body: RegisterNewUserDto = { ...newUser };
    const catchFunc = (e) => {
      expect(e instanceof BadRequestException).toEqual(true);
      expect(e.response).toMatchObject({
        statusCode: 400,
        message: validationMessages.invalid.password,
        error: 'Bad Request',
      });
    };

    try {
      body.password = '123';
      await controller.register(body);
    } catch (e) {
      catchFunc(e);
    }

    try {
      body.password = '123456test';
      await controller.register(body);
    } catch (e) {
      catchFunc(e);
    }

    try {
      body.password = '123456test!@';
      await controller.register(body);
    } catch (e) {
      catchFunc(e);
    }

    try {
      body.password = '123456TEST!@';
      await controller.register(body);
    } catch (e) {
      catchFunc(e);
    }
  });

  it('should add new user', async () => {
    const result: AuthLoginDto = await controller.register(newUser);
    expect(result).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          username: newUser.username,
          password: expect.any(String),
          email: null,
          bio: null,
          avatar: null,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
          id: expect.any(Number),
          phoneNumber: utils.normalizePhoneNumber(newUser.phoneNumber),
        }),
      }),
    );
  });

  it('should not add new user when its already exists (username)', async () => {
    try {
      const body: RegisterNewUserDto = { ...newUser };
      body.phoneNumber = '09301111111';
      await controller.register(body);
    } catch (e) {
      expect(e instanceof ConflictException).toEqual(true);
      expect(e.response).toMatchObject({
        statusCode: 409,
        message: exceptionMessages.exist.user,
        error: 'Conflict',
      });
    }
  });

  it('should not add new user when its already exists (phoneNumber)', async () => {
    try {
      const body: RegisterNewUserDto = { ...newUser };
      body.username = 'test2';
      await controller.register(body);
    } catch (e) {
      expect(e instanceof ConflictException).toEqual(true);
      expect(e.response).toMatchObject({
        statusCode: 409,
        message: exceptionMessages.exist.user,
        error: 'Conflict',
      });
    }
  });

  //  --------------------- login ---------------------

  // it('should user login with phoneNumber', async () => {
  //   const result: AuthLoginDto = await controller.register(newUser);
  //   expect(result).toEqual(
  //     expect.objectContaining({
  //       token: expect.any(String),
  //       user: expect.objectContaining({
  //         username: newUser.username,
  //         password: expect.any(String),
  //         email: null,
  //         bio: null,
  //         avatar: null,
  //         created_at: expect.any(Date),
  //         updated_at: expect.any(Date),
  //         id: expect.any(Number),
  //         phoneNumber: utils.normalizePhoneNumber(newUser.phoneNumber),
  //       }),
  //     }),
  //   );
  // });
});
