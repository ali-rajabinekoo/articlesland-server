import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
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
import { getUsersLimit } from '../libs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private getRelations = (hasNotification?: boolean) => {
    const relations = [
      'articles',
      'articles.category',
      'articles.owner',
      'followers',
      'followings',
      'reports',
      'likes',
      'likes.owner',
      'likes.category',
      'bookmarks',
      'bookmarks.category',
      'bookmarks.owner',
      'selectedCategories',
    ];
    if (!!hasNotification) {
      relations.push('notifications');
      relations.push('notifications.owner');
      relations.push('notifications.creator');
      relations.push('notifications.article');
    }
    return relations;
  };

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

  async findUserById(id: number, hasNotification?: boolean): Promise<User> {
    const findQuery: FindOneOptions = {
      where: { id },
      relations: this.getRelations(hasNotification),
    };
    if (!!hasNotification) {
      findQuery.order = { notifications: { created_at: 'desc' } };
    }
    return this.usersRepository.findOne(findQuery);
  }

  async findUserByUsername(
    username: string,
    unpublished?: boolean,
  ): Promise<User> {
    const where: FindOptionsWhere<User> = {
      username,
      articles: { published: !unpublished },
    };
    return this.usersRepository.findOne({
      where,
      relations: this.getRelations(),
    });
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { email },
      relations: this.getRelations(),
    });
  }

  async findUserByRefreshToken(refreshToken: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { refreshToken },
      relations: this.getRelations(),
    });
  }

  async findUsers(
    keyword?: string | undefined,
    page?: number | undefined,
  ): Promise<[User[], number]> {
    const wheres: FindOptionsWhere<User>[] = [];
    const findQuery: FindManyOptions = {
      relations: this.getRelations(),
      skip: getUsersLimit * (page || 1) - getUsersLimit || 0,
      take: getUsersLimit,
    };
    if (!!keyword?.trim()) {
      wheres[0] = { username: ILike(`%${keyword}%`) };
      wheres[1] = { displayName: ILike(`%${keyword}%`) };
    }
    if (wheres.length !== 0) {
      findQuery.where = wheres;
    }
    return this.usersRepository.findAndCount(findQuery);
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
