import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import * as httpMocks from 'node-mocks-http';
import { TypeOrmTestingModule } from '../app.module.test';
import { Repository } from 'typeorm';
import utils from '../libs/utils';
import {
  RegisterNewUserDto,
  SendEmailVerificationCodeDto,
  VerifyByCodeDto,
} from './user.dto';
import { exceptionMessages } from '../libs/messages';
import { ConflictException, NotAcceptableException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let repository: Repository<User>;
  let req: httpMocks.MockRequest<any>;
  let user: User;
  const sendEmailVerificationBody: SendEmailVerificationCodeDto =
    new SendEmailVerificationCodeDto();
  const verificationCodeBody: VerifyByCodeDto = new VerifyByCodeDto();
  const newUser: RegisterNewUserDto = new RegisterNewUserDto();
  const duplicatedUser: User = new User();

  const setNewUser = () => {
    newUser.username = 'test-user';
    newUser.password = 'Test1234@1';
    newUser.repeatPassword = 'Test1234@1';
    newUser.phoneNumber = utils.normalizePhoneNumber('+98357877418');
  };

  const createDuplicatedUser = async (email?: string) => {
    duplicatedUser.username = 'test-user2';
    duplicatedUser.password = 'Test1234@1';
    duplicatedUser.phoneNumber = utils.normalizePhoneNumber('+98357877411');
    if (!!email) duplicatedUser.email = email;
    await repository.save(duplicatedUser);
  };

  const removeDuplicatedUser = async () => {
    const user: User = await repository.findOneBy({
      username: duplicatedUser.username,
    });
    if (!!user) await repository.remove(user);
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([User]), ...TypeOrmTestingModule()],
      providers: [UserService],
      exports: [UserService],
      controllers: [UserController],
    }).compile();

    controller = module.get<UserController>(UserController);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    setNewUser();

    const newUserInstance: User = await repository.create(newUser);
    newUserInstance.activated = true;
    await repository.save(newUserInstance);
    user = await repository.findOneBy({ username: newUser.username });
  });

  afterAll(async () => {
    const user: User = await repository.findOneBy({
      username: newUser.username,
    });
    if (!!user) await repository.remove(user);

    await utils.clearKeyValueTable();
  });

  beforeEach(async () => {
    setNewUser();

    sendEmailVerificationBody.email = 'a.rajabinekoo@protonmail.com';
    verificationCodeBody.code = '111111';

    req = httpMocks.createRequest();
    req.res = httpMocks.createResponse();
    req.user = user;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should returns user info', async () => {
    const userInfo: User = await controller.getUserInformation(req);
    expect(userInfo).toMatchObject({
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

  it('should not send email verification code when email used by another user', async () => {
    try {
      await createDuplicatedUser(sendEmailVerificationBody.email);
      await controller.sendEmailVerificationCode(
        sendEmailVerificationBody,
        req,
      );
    } catch (result: NotAcceptableException | any) {
      expect(result instanceof NotAcceptableException).toEqual(true);
      expect(result.status).toBe(406);
      expect(result.response).toMatchObject({
        statusCode: 406,
        message: exceptionMessages.exist.email,
        error: 'Not Acceptable',
      });
    }
  });

  it('should verify email by code', async () => {
    await removeDuplicatedUser();
    await controller.sendEmailVerificationCode(sendEmailVerificationBody, req);

    const user: User = await controller.verifyEmailByCode(
      verificationCodeBody,
      req,
    );
    const newUser: User = { ...req.user };
    newUser.email = sendEmailVerificationBody.email;
    delete newUser.updated_at;

    expect(user).toMatchObject(newUser);
  });
});
