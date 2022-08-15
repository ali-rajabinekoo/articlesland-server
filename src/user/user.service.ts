import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LoginByCredentialDto,
  RegisterNewUserDto,
  SendLoginCodeDto,
  UserUniqueInfoDto,
} from './user.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import utils from '../libs/utils';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
  }

  async findUserByUniqueInfo(body: UserUniqueInfoDto): Promise<User> {
    const user: User = await this.usersRepository.findOneBy({
      username: body.username,
    });
    if (!!user) return user;
    return await this.usersRepository.findOneBy({
      phoneNumber: body.phoneNumber,
    });
  }

  async findUserByCredential(info: LoginByCredentialDto): Promise<User> {
    const user: User = await this.usersRepository.findOneBy({
      username: info.username,
    });
    if (!user) return null;
    if (await bcrypt.compare(user.password, info.password)) {
      return user;
    }
    return null;
  }

  async findUserByPhoneNumber(info: SendLoginCodeDto): Promise<User> {
    return this.usersRepository.findOneBy({
      phoneNumber: utils.normalizePhoneNumber(info.phoneNumber),
    });
  }

  async findUserById(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  async verifyUser(user: User): Promise<void> {
    user.activated = true;
    await this.usersRepository.save(user);
  }

  async addNewUser(body: RegisterNewUserDto): Promise<User> {
    body.password = await bcrypt.hash(body.password, 10);
    const user = await this.usersRepository.create(body);
    await this.usersRepository.save(user);
    return user;
  }
}
