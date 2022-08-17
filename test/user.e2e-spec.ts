import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AppModuleTestMetadata } from '../src/app.module.test';
import { Repository } from 'typeorm';
import { User } from '../src/user/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import utils from '../src/libs/utils';
import { LoginByCredentialDto, RegisterNewUserDto } from '../src/user/user.dto';
import * as request from 'supertest';
import { validationMessages } from '../src/libs/messages';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const route = '/user';
  const authRoute = '/auth';
  let repository: Repository<User>;
  let user: User;
  let token: string;
  const loginBody: LoginByCredentialDto = new LoginByCredentialDto();
  const newUser: RegisterNewUserDto = new RegisterNewUserDto();

  const setNewUser = () => {
    newUser.username = 'test-user';
    newUser.password = 'Test1234@1';
    newUser.repeatPassword = 'Test1234@1';
    newUser.phoneNumber = utils.normalizePhoneNumber('+98357877418');
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule(
      AppModuleTestMetadata,
    ).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    repository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));

    setNewUser();

    const newUserInstance: User = await repository.create(newUser);
    newUserInstance.activated = true;
    await repository.save(newUserInstance);
    user = await repository.findOneBy({ username: newUser.username });

    loginBody.username = newUser.username;
    loginBody.password = newUser.password;
  });

  afterAll(async () => {
    const user: User = await repository.findOneBy({
      username: newUser.username,
    });
    if (!!user) await repository.remove(user);
  });

  it('should login', async () => {
    const loginResult: request.Response = await request(app.getHttpServer())
      .post(`${authRoute}/login`)
      .send(loginBody);

    expect(loginResult.statusCode).toBe(200);
    expect(loginResult.body).toEqual(
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

    token = loginResult.body.token;
  });

  it(`${route}/info (GET - 200)`, async () => {
    const result: request.Response = await request(app.getHttpServer())
      .get(`${route}/info`)
      .set('authorization', `bearer ${token}`)
      .send();

    expect(result.statusCode).toBe(200);
    expect(result.body).toMatchObject({
      username: newUser.username,
      email: null,
      bio: null,
      avatar: null,
      created_at: expect.any(String),
      updated_at: expect.any(String),
      id: expect.any(Number),
      phoneNumber: utils.normalizePhoneNumber(newUser.phoneNumber),
    });
  });
});
