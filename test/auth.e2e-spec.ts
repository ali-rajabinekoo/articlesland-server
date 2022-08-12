import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { RegisterNewUserDto } from '../src/user/user.dto';
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
  const newUser: RegisterNewUserDto = new RegisterNewUserDto();

  beforeAll(async () => {
    newUser.username = 'test-2e2';
    newUser.password = 'Test1234@12e2';
    newUser.repeatPassword = 'Test1234@12e2';
    newUser.phoneNumber = '+989212210221';
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule(
      AppModuleTestMetadata,
    ).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    repository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    const user: User = await repository.findOneBy({
      username: newUser.username,
    });
    if (!!user) await repository.remove(user);
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
        token: expect.any(String),
        user: expect.objectContaining({
          username: newUser.username,
          email: null,
          bio: null,
          avatar: null,
          created_at: expect.any(String),
          updated_at: expect.any(String),
          id: expect.any(Number),
          phoneNumber: utils.normalizePhoneNumber(newUser.phoneNumber),
        }),
      }),
    );

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
      id: expect.any(Number),
      phoneNumber: utils.normalizePhoneNumber(newUser.phoneNumber),
    });
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
    body.username = 'test2';
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
});
