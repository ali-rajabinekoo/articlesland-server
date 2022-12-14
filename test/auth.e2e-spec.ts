import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import {
  RegisterNewUserDto,
  SendLoginCodeDto,
  VerificationCodeDto,
} from '../src/user/user.dto';
import { AppModuleTestMetadata } from '../src/app.module.test';
import utils from '../src/libs/utils';
import { exceptionMessages, validationMessages } from '../src/libs/messages';
import { Repository } from 'typeorm';
import { User } from '../src/user/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const route = '/auth';
  let repository: Repository<User>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const newUser: RegisterNewUserDto = new RegisterNewUserDto();
  const sendLoginCodeInfo: SendLoginCodeDto = new SendLoginCodeDto();
  const signupVerificationBody = new VerificationCodeDto();
  const loginByCodeInfo: VerificationCodeDto = new VerificationCodeDto();
  let key = '';

  const removeTestUser = async () => {
    const user: User = await repository.findOneBy({
      username: newUser.username,
    });
    if (!!user) await repository.remove(user);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule(
      AppModuleTestMetadata,
    ).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    repository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));

    await removeTestUser();
    await utils.verification.clearKeyValueTable();
  });

  beforeEach(() => {
    const phone = '+989212210982';
    newUser.username = 'testendtoend';
    newUser.password = 'Test1234@12e2';
    newUser.repeatPassword = 'Test1234@12e2';
    newUser.phoneNumber = phone;

    sendLoginCodeInfo.phoneNumber = phone;

    loginByCodeInfo.code = '111111';
    signupVerificationBody.code = '111111';
  });

  afterAll(async () => {
    await removeTestUser();
    await utils.verification.clearKeyValueTable();
  });

  it(`${route}/register (POST - 400) | Empty field (username)`, async () => {
    const body: RegisterNewUserDto = { ...newUser };
    body.username = '';
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/register`)
      .send(body);

    expect(result.statusCode).toBe(400);
    expect(result.body).toMatchObject({
      statusCode: 400,
      message: expect.arrayContaining([validationMessages.empty.username]),
      error: 'Bad Request',
    });
  });

  it(`${route}/register (POST - 400) | Empty field (password)`, async () => {
    const body: RegisterNewUserDto = { ...newUser };
    body.password = '';
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/register`)
      .send(body);

    expect(result.statusCode).toBe(400);
    expect(result.body).toMatchObject({
      statusCode: 400,
      message: expect.arrayContaining([validationMessages.empty.password]),
      error: 'Bad Request',
    });
  });

  it(`${route}/register (POST - 400) | Empty field (repeatPassword)`, async () => {
    const body: RegisterNewUserDto = { ...newUser };
    body.repeatPassword = '';
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/register`)
      .send(body);

    expect(result.statusCode).toBe(400);
    expect(result.body).toMatchObject({
      statusCode: 400,
      message: expect.arrayContaining([
        validationMessages.empty.repeatPassword,
      ]),
      error: 'Bad Request',
    });
  });

  it(`${route}/register (POST - 400) | Empty field (phoneNumber)`, async () => {
    const body: RegisterNewUserDto = { ...newUser };
    body.phoneNumber = '';
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/register`)
      .send(body);

    expect(result.statusCode).toBe(400);
    expect(result.body).toMatchObject({
      statusCode: 400,
      message: expect.arrayContaining([validationMessages.empty.phoneNumber]),
      error: 'Bad Request',
    });
  });

  it(`${route}/register (POST - 400) | Invalid password`, async () => {
    const body: RegisterNewUserDto = { ...newUser };

    body.password = '123456';
    let result: request.Response = await request(app.getHttpServer())
      .post(`${route}/register`)
      .send(body);
    expect(result.statusCode).toBe(400);
    expect(result.body).toMatchObject({
      statusCode: 400,
      message: validationMessages.invalid.password,
      error: 'Bad Request',
    });

    body.password = '123456test';
    result = await request(app.getHttpServer())
      .post(`${route}/register`)
      .send(body);
    expect(result.statusCode).toBe(400);
    expect(result.body).toMatchObject({
      statusCode: 400,
      message: validationMessages.invalid.password,
      error: 'Bad Request',
    });

    body.password = '123456test!@';
    result = await request(app.getHttpServer())
      .post(`${route}/register`)
      .send(body);
    expect(result.statusCode).toBe(400);
    expect(result.body).toMatchObject({
      statusCode: 400,
      message: validationMessages.invalid.password,
      error: 'Bad Request',
    });

    body.password = '123456TEST!@';
    result = await request(app.getHttpServer())
      .post(`${route}/register`)
      .send(body);
    expect(result.statusCode).toBe(400);
    expect(result.body).toMatchObject({
      statusCode: 400,
      message: validationMessages.invalid.password,
      error: 'Bad Request',
    });
  });

  it(`${route}/register (POST - 400) | Invalid repeatPassword`, async () => {
    const body: RegisterNewUserDto = { ...newUser };
    body.repeatPassword = '123456';
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/register`)
      .send(body);

    expect(result.statusCode).toBe(400);
    expect(result.body).toMatchObject({
      statusCode: 400,
      message: validationMessages.invalid.repeatPassword,
      error: 'Bad Request',
    });
  });

  it(`${route}/register (POST - 400) | Invalid phoneNumber`, async () => {
    const body: RegisterNewUserDto = { ...newUser };
    body.phoneNumber = '123456';
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/register`)
      .send(body);

    expect(result.statusCode).toBe(400);
    expect(result.body).toMatchObject({
      statusCode: 400,
      message: expect.arrayContaining([validationMessages.invalid.phoneNumber]),
      error: 'Bad Request',
    });
  });

  it(`${route}/register (POST - 201)`, async () => {
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/register`)
      .send(newUser);

    expect(result.statusCode).toBe(201);
    expect(result.body).toEqual(
      expect.objectContaining({
        key: expect.any(String),
      }),
    );

    key = result.body.key;

    // db assertion
    const user: User = await repository.findOneBy({
      username: newUser.username,
    });
    expect(user).toMatchObject({
      username: newUser.username,
      password: expect.any(String),
      email: null,
      bio: null,
      avatar: null,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
      activated: false,
      id: expect.any(Number),
      phoneNumber: utils.verification.normalizePhoneNumber(newUser.phoneNumber),
    });
  });

  it(`${route}/register (POST - 406) | NotAcceptable until verification code does not expire`, async () => {
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/register`)
      .send(newUser);

    expect(result.statusCode).toBe(406);
    expect(result.body).toMatchObject({
      statusCode: 406,
      message: exceptionMessages.notAcceptable.code,
      error: 'Not Acceptable',
    });
  });

  it(`${route}/register/verify (POST - 403) | Bad key`, async () => {
    signupVerificationBody.key = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/register/verify`)
      .send(signupVerificationBody);

    expect(result.statusCode).toBe(403);
    expect(result.body).toMatchObject({
      statusCode: 403,
      message: exceptionMessages.invalid.code,
      error: 'Forbidden',
    });
  });

  it(`${route}/register/verify (POST - 403) | Bad code`, async () => {
    signupVerificationBody.code = '111111';
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/register/verify`)
      .send(signupVerificationBody);

    expect(result.statusCode).toBe(403);
    expect(result.body).toMatchObject({
      statusCode: 403,
      message: exceptionMessages.invalid.code,
      error: 'Forbidden',
    });
  });

  it(`${route}/register/verify (POST - 200)`, async () => {
    signupVerificationBody.key = key;
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/register/verify`)
      .send(signupVerificationBody);

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          username: newUser.username,
          email: null,
          bio: null,
          avatar: null,
          created_at: expect.any(String),
          updated_at: expect.any(String),
          id: expect.any(Number),
          phoneNumber: utils.verification.normalizePhoneNumber(
            newUser.phoneNumber,
          ),
        }),
      }),
    );
  });

  it(`${route}/register (POST - 409) | Already exist (username)`, async () => {
    const body: RegisterNewUserDto = { ...newUser };
    body.phoneNumber = '09301111111';
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/register`)
      .send(body);

    expect(result.statusCode).toBe(409);
    expect(result.body).toMatchObject({
      statusCode: 409,
      message: exceptionMessages.exist.user,
      error: 'Conflict',
    });
  });

  it(`${route}/register (POST - 409) | Already exist (phoneNumber)`, async () => {
    const body: RegisterNewUserDto = { ...newUser };
    body.username = 'testttttttttttt';
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/register`)
      .send(body);

    expect(result.statusCode).toBe(409);
    expect(result.body).toMatchObject({
      statusCode: 409,
      message: exceptionMessages.exist.user,
      error: 'Conflict',
    });
  });

  // --------------------- login -----------------------

  it(`${route}/login/mobile/send (POST - 400) | Empty phoneNumber`, async () => {
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/login/mobile/send`)
      .send(new SendLoginCodeDto());

    expect(result.statusCode).toBe(400);
    expect(result.body).toMatchObject({
      statusCode: 400,
      message: expect.arrayContaining([validationMessages.invalid.phoneNumber]),
      error: 'Bad Request',
    });

    const body: SendLoginCodeDto = new SendLoginCodeDto();
    body.phoneNumber = '0909090';
    const result2: request.Response = await request(app.getHttpServer())
      .post(`${route}/login/mobile/send`)
      .send(body);

    expect(result2.statusCode).toBe(400);
    expect(result2.body).toMatchObject({
      statusCode: 400,
      message: expect.arrayContaining([validationMessages.invalid.phoneNumber]),
      error: 'Bad Request',
    });
  });

  it(`${route}/login/mobile/send (POST - 404) | User not found`, async () => {
    const body: SendLoginCodeDto = new SendLoginCodeDto();
    body.phoneNumber = '09111111111';

    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/login/mobile/send`)
      .send(body);

    expect(result.statusCode).toBe(404);
    expect(result.body).toMatchObject({
      statusCode: 404,
      message: exceptionMessages.notFound.user,
      error: 'Not Found',
    });
  });

  it(`${route}/login/mobile/send (POST - 200)`, async () => {
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/login/mobile/send`)
      .send(sendLoginCodeInfo);

    expect(result.statusCode).toBe(200);
    expect(result.body).toMatchObject({
      key: expect.any(String),
    });
    expect(result.body.key.length).toEqual(36);
    loginByCodeInfo.key = result.body.key;
  });

  it(`${route}/login/mobile/send (POST - 406) | Wait until code expiration time`, async () => {
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/login/mobile/send`)
      .send(sendLoginCodeInfo);

    expect(result.statusCode).toBe(406);
    expect(result.body).toMatchObject({
      statusCode: 406,
      message: exceptionMessages.notAcceptable.code,
      error: 'Not Acceptable',
    });
  });

  it(`${route}/login/mobile/check (POST - 403) | Invalid code or key`, async () => {
    const body: VerificationCodeDto = new VerificationCodeDto();
    body.key = loginByCodeInfo.key;
    body.code = '111112';

    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/login/mobile/check`)
      .send(body);

    expect(result.statusCode).toBe(403);
    expect(result.body).toMatchObject({
      statusCode: 403,
      message: exceptionMessages.invalid.code,
      error: 'Forbidden',
    });

    body.key = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
    body.code = loginByCodeInfo.code;

    const result2: request.Response = await request(app.getHttpServer())
      .post(`${route}/login/mobile/check`)
      .send(body);

    expect(result2.statusCode).toBe(403);
    expect(result2.body).toMatchObject({
      statusCode: 403,
      message: exceptionMessages.invalid.code,
      error: 'Forbidden',
    });
  });

  it(`${route}/login/mobile/check (POST - 200)`, async () => {
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/login/mobile/check`)
      .send(loginByCodeInfo);

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          username: newUser.username,
          email: null,
          bio: null,
          avatar: null,
          created_at: expect.any(String),
          updated_at: expect.any(String),
          id: expect.any(Number),
          phoneNumber: utils.verification.normalizePhoneNumber(
            newUser.phoneNumber,
          ),
        }),
      }),
    );
  });

  it(`${route}/login/mobile/check (POST - 403) | Invalid code or key`, async () => {
    const result: request.Response = await request(app.getHttpServer())
      .post(`${route}/login/mobile/check`)
      .send(loginByCodeInfo);

    expect(result.statusCode).toBe(403);
    expect(result.body).toMatchObject({
      statusCode: 403,
      message: exceptionMessages.invalid.code,
      error: 'Forbidden',
    });
  });
});
