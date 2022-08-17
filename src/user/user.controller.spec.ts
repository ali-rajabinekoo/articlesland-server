import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import * as httpMocks from 'node-mocks-http';
import { TypeOrmTestingModule } from '../app.module.test';
import { Repository } from 'typeorm';
import utils from '../libs/utils';
import { RegisterNewUserDto } from './user.dto';

describe('UserController', () => {
  let controller: UserController;
  let repository: Repository<User>;
  let req: httpMocks.MockRequest<any>;
  let user: User;
  const newUser: RegisterNewUserDto = new RegisterNewUserDto();

  const setNewUser = () => {
    newUser.username = 'test-user';
    newUser.password = 'Test1234@1';
    newUser.repeatPassword = 'Test1234@1';
    newUser.phoneNumber = utils.normalizePhoneNumber('+98357877418');
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
});
