import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

describe('UserService', () => {
  let service: UserService;

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     imports: [TypeOrmModule.forFeature([User])],
  //     providers: [UserService],
  //     exports: [UserService],
  //   }).compile();
  //
  //   service = module.get<UserService>(UserService);
  // });

  it('should be defined', () => {
    expect(service).not.toBeDefined();
  });
});
