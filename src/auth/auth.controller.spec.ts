import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '../libs/config';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmTestingModule } from '../app.module.test';
import {
  LoginByCodeDto,
  LoginByCredentialDto,
  RegisterNewUserDto,
  SendLoginCodeDto,
  SignupVerificationDto,
} from '../user/user.dto';
import { User } from '../user/user.entity';
import utils from '../libs/utils';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthLoginDto } from './auth.dto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { exceptionMessages, validationMessages } from '../libs/messages';

describe('AuthController', () => {
  let controller: AuthController;
  let repository: Repository<User>;
  let key: string;
  const signupVerificationBody = new SignupVerificationDto();
  const loginByCodeBody = new LoginByCodeDto();
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

    await utils.clearKeyValueTable();
  });

  afterAll(async () => {
    const user: User = await repository.findOneBy({
      username: newUser.username,
    });
    if (!!user) await repository.remove(user);

    await utils.clearKeyValueTable();
  });

  beforeEach(() => {
    newUser.username = 'test';
    newUser.password = 'Test1234@1';
    newUser.repeatPassword = 'Test1234@1';
    newUser.phoneNumber = '+989212210982';

    signupVerificationBody.code = '123456789';
    loginByCodeBody.code = '123456789';
  });

  //  --------------------- signup ---------------------

  it('should not add new user when password and repeatPassword are not same', async () => {
    try {
      const body: RegisterNewUserDto = { ...newUser };
      body.repeatPassword = '123';
      const result = await controller.register(body);
      expect(result).toBe(undefined);
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

  it('should not verify new user with bad key', async () => {
    try {
      signupVerificationBody.key = 'badkey';
      const result: AuthLoginDto = await controller.registerVerify(
        signupVerificationBody,
      );
      expect(result).toBe(undefined);
    } catch (e) {
      expect(e instanceof ForbiddenException).toEqual(true);
      expect(e.response).toMatchObject({
        statusCode: 403,
        message: exceptionMessages.invalid.code,
        error: 'Forbidden',
      });
    }
  });

  it('should not verify new user with bad code', async () => {
    try {
      signupVerificationBody.code = 'badcode';
      const result: AuthLoginDto = await controller.registerVerify(
        signupVerificationBody,
      );
      expect(result).toBe(undefined);
    } catch (e) {
      expect(e instanceof ForbiddenException).toEqual(true);
      expect(e.response).toMatchObject({
        statusCode: 403,
        message: exceptionMessages.invalid.code,
        error: 'Forbidden',
      });
    }
  });

  it('should add new user', async () => {
    const result: { key: string } = await controller.register(newUser);
    key = result.key;
    expect(result).toEqual(
      expect.objectContaining({
        key: expect.any(String),
      }),
    );

    const user: User = await repository.findOneBy({
      username: newUser.username,
    });
    expect(user).toMatchObject({
      username: newUser.username,
      password: expect.any(String),
      email: null,
      bio: null,
      avatar: null,
      activated: false,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
      id: expect.any(Number),
      phoneNumber: utils.normalizePhoneNumber(newUser.phoneNumber),
    });
  });

  it('should not verify new user with bad verification code', async () => {
    try {
      signupVerificationBody.code = 'badcode';
      const result: AuthLoginDto = await controller.registerVerify(
        signupVerificationBody,
      );
      expect(result).toBe(undefined);
    } catch (e) {
      expect(e instanceof ForbiddenException).toEqual(true);
      expect(e.response).toMatchObject({
        statusCode: 403,
        message: exceptionMessages.invalid.code,
        error: 'Forbidden',
      });
    }
  });

  it('should not verify new user with bad verification key', async () => {
    try {
      signupVerificationBody.key = 'badkey';
      const result: AuthLoginDto = await controller.registerVerify(
        signupVerificationBody,
      );
      expect(result).toBe(undefined);
    } catch (e) {
      expect(e instanceof ForbiddenException).toEqual(true);
      expect(e.response).toMatchObject({
        statusCode: 403,
        message: exceptionMessages.invalid.code,
        error: 'Forbidden',
      });
    }
  });

  it('should verify new user', async () => {
    signupVerificationBody.key = key;
    const result: AuthLoginDto = await controller.registerVerify(
      signupVerificationBody,
    );
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

    const user: User = await repository.findOneBy({
      username: newUser.username,
    });
    expect(user).toMatchObject({
      username: newUser.username,
      password: expect.any(String),
      email: null,
      bio: null,
      avatar: null,
      activated: true,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
      id: expect.any(Number),
      phoneNumber: utils.normalizePhoneNumber(newUser.phoneNumber),
    });
  });

  it('should not add new user when its already exists (username)', async () => {
    try {
      const body: RegisterNewUserDto = { ...newUser };
      body.phoneNumber = '09301111111';
      const result = await controller.register(body);
      expect(result).toBe(undefined);
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
      const result = await controller.register(body);
      expect(result).toBe(undefined);
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

  it('should not user login with bad password', async () => {
    try {
      const body: LoginByCredentialDto = new LoginByCredentialDto();
      body.username = newUser.username;
      body.password = `${newUser.password}-badtest`;
      const result: AuthLoginDto = await controller.login(body);
      expect(result).toBe(undefined);
    } catch (e) {
      expect(e instanceof NotFoundException).toEqual(true);
      expect(e.response).toMatchObject({
        statusCode: 404,
        message: exceptionMessages.notFound.user,
        error: 'Not Found',
      });
    }
  });

  it('should not user login when it is not found', async () => {
    try {
      const body: LoginByCredentialDto = new LoginByCredentialDto();
      body.username = `${newUser.username}-badtest`;
      body.password = `${newUser.password}-badtest`;
      const result: AuthLoginDto = await controller.login(body);
      expect(result).toBe(undefined);
    } catch (e) {
      expect(e instanceof NotFoundException).toEqual(true);
      expect(e.response).toMatchObject({
        statusCode: 404,
        message: exceptionMessages.notFound.user,
        error: 'Not Found',
      });
    }
  });

  it('should user login with username and password', async () => {
    const body: LoginByCredentialDto = new LoginByCredentialDto();
    body.username = newUser.username;
    body.password = newUser.password;
    const result: AuthLoginDto = await controller.login(body);

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

  it('should send login verification code', async () => {
    const body: SendLoginCodeDto = new SendLoginCodeDto();
    body.phoneNumber = newUser.phoneNumber;
    const result: { key: string } = await controller.loginByCode(body);
    loginByCodeBody.key = result.key;

    expect(result).toEqual(
      expect.objectContaining({
        key: expect.any(String),
      }),
    );
  });

  it('should not send login verification code when its not expired', async () => {
    try {
      const body: SendLoginCodeDto = new SendLoginCodeDto();
      body.phoneNumber = newUser.phoneNumber;
      const result: { key: string } = await controller.loginByCode(body);
      expect(result).toBe(undefined);
    } catch (e) {
      expect(e instanceof NotAcceptableException).toEqual(true);
      expect(e.response).toMatchObject({
        statusCode: 406,
        message: exceptionMessages.notAcceptable.code,
        error: 'Not Acceptable',
      });
    }
  });

  it('should login with bad verification code', async () => {
    try {
      loginByCodeBody.code = '123';
      const result: AuthLoginDto = await controller.loginByCodeChecker(
        loginByCodeBody,
      );
      expect(result).toBeUndefined();
    } catch (e) {
      expect(e instanceof ForbiddenException).toEqual(true);
      expect(e.response).toMatchObject({
        statusCode: 403,
        message: exceptionMessages.invalid.code,
        error: 'Forbidden',
      });
    }
  });

  it('should login with bad key at verification code step', async () => {
    let savedKey: string;
    try {
      savedKey = loginByCodeBody.key;
      loginByCodeBody.key = '123';
      const result: AuthLoginDto = await controller.loginByCodeChecker(
        loginByCodeBody,
      );
      expect(result).toBeUndefined();
    } catch (e) {
      loginByCodeBody.key = savedKey;
      expect(e instanceof ForbiddenException).toEqual(true);
      expect(e.response).toMatchObject({
        statusCode: 403,
        message: exceptionMessages.invalid.code,
        error: 'Forbidden',
      });
    }
  });

  it('should verify login code', async () => {
    const result: AuthLoginDto = await controller.loginByCodeChecker(
      loginByCodeBody,
    );

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

  it('should not send login verification code when user not verified in register step', async () => {
    try {
      const user: User = await repository.findOneBy({
        username: newUser.username,
      });
      expect(user).not.toBeNull();
      expect(user).not.toBeUndefined();
      user.activated = false;
      await repository.save(user);

      const body: SendLoginCodeDto = new SendLoginCodeDto();
      body.phoneNumber = newUser.phoneNumber;
      const result: { key: string } = await controller.loginByCode(body);
      expect(result).toBe(undefined);
    } catch (e) {
      expect(e instanceof NotFoundException).toEqual(true);
      expect(e.response).toMatchObject({
        statusCode: 404,
        message: exceptionMessages.notFound.user,
        error: 'Not Found',
      });

      const user: User = await repository.findOneBy({
        username: newUser.username,
      });
      expect(user).not.toBeNull();
      expect(user).not.toBeUndefined();
      user.activated = true;
      await repository.save(user);
    }
  });
});
