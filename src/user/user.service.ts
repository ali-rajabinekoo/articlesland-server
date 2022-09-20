import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUserQuery,
  LoginByCredentialDto,
  RegisterNewUserDto,
  SendLoginCodeDto,
  UserUniqueInfoDto,
} from './user.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import utils from '../libs/utils';
import { MellipayamakResponse } from '../libs/schemas';
import request from '../libs/request';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

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
    if (await bcrypt.compare(info.password, user.password)) {
      return user;
    }
    return null;
  }

  async findUserByPhoneNumber(info: SendLoginCodeDto): Promise<User> {
    return this.usersRepository.findOneBy({
      phoneNumber: utils.verification.normalizePhoneNumber(info.phoneNumber),
    });
  }

  async findUserById(id: number): Promise<User> {
    return this.usersRepository.findOne({
      where: { id },
      relations: [
        'articles',
        'articles.category',
        'followers',
        'following',
        'reports',
        'likes',
        'bookmarks',
        'selectedCategories',
      ],
    });
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { email },
      relations: [
        'articles',
        'followers',
        'following',
        'reports',
        'likes',
        'bookmarks',
        'selectedCategories',
      ],
    });
  }

  async findUserByRefreshToken(refreshToken: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { refreshToken },
      relations: [
        'articles',
        'followers',
        'following',
        'reports',
        'likes',
        'bookmarks',
        'selectedCategories',
      ],
    });
  }

  async verifyUser(user: User): Promise<void> {
    user.activated = true;
    await this.usersRepository.save(user);
  }

  async addNewUser(body: RegisterNewUserDto): Promise<User> {
    const query: CreateUserQuery = { ...body };
    query.displayName = body.username;
    const user = await this.usersRepository.create(query);
    await this.usersRepository.save(user);
    return user;
  }

  async saveUser(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async sendCode(user: User): Promise<boolean> {
    const { code } = await utils.verification.generateUpdateMobileCode(user);
    const { Value }: MellipayamakResponse = await request.sendSms(
      user.phoneNumber,
      [code],
    );
    return Value.length >= 15;
  }
}
