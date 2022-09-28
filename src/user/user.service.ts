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
import { Article } from '../article/article.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private formatUsersFields(followedUsers: User[]): User[] {
    return followedUsers.map((el: User) => {
      delete el.refreshToken;
      delete el.email;
      delete el.phoneNumber;
      delete el.password;
      delete el.activated;
      delete el.created_at;
      delete el.updated_at;
      return el;
    });
  }

  private formatSingleUserFields(followedUser: User): User {
    const user: User = { ...followedUser } as User;
    delete user.refreshToken;
    delete user.email;
    delete user.phoneNumber;
    delete user.password;
    delete user.activated;
    delete user.created_at;
    delete user.updated_at;
    return user;
  }

  private normalizeAnotherUserFields(user: User): User {
    if (user === null) return null;
    if (!!user?.followings && user?.followings.length !== 0) {
      user.followings = this.formatUsersFields(user.followings);
    }
    if (!!user.followers && user?.followers.length !== 0) {
      user.followers = this.formatUsersFields(user.followers);
    }
    if (!!user.bookmarks && user?.bookmarks.length !== 0) {
      user.bookmarks = user.bookmarks.map((el: Article) => {
        const newEl: Article = { ...el } as Article;
        newEl.owner = this.formatSingleUserFields(el.owner);
        return newEl;
      });
    }
    if (!!user.articles && user?.articles.length !== 0) {
      user.articles = user.articles.map((el: Article) => {
        const newEl: Article = { ...el } as Article;
        newEl.owner = this.formatSingleUserFields(el.owner);
        return newEl;
      });
    }
    return user;
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
    return this.normalizeAnotherUserFields(
      await this.usersRepository.findOne({
        where: { id },
        relations: [
          'articles',
          'articles.category',
          'articles.owner',
          'followers',
          'followings',
          'reports',
          'likes',
          'bookmarks',
          'bookmarks.category',
          'bookmarks.owner',
          'selectedCategories',
        ],
      }),
    );
  }

  async findUserByUsername(username: string): Promise<User> {
    const user: User = this.normalizeAnotherUserFields(
      await this.usersRepository.findOne({
        where: { username },
        relations: [
          'articles',
          'articles.category',
          'articles.owner',
          'followers',
          'followings',
          'reports',
          'likes',
          'bookmarks',
          'bookmarks.category',
          'bookmarks.owner',
          'selectedCategories',
        ],
      }),
    );
    user.articles = user.articles.filter((el) => el.published);
    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.normalizeAnotherUserFields(
      await this.usersRepository.findOne({
        where: { email },
        relations: [
          'articles',
          'articles.owner',
          'followers',
          'followings',
          'reports',
          'likes',
          'bookmarks',
          'bookmarks.category',
          'bookmarks.owner',
          'selectedCategories',
        ],
      }),
    );
  }

  async findUserByRefreshToken(refreshToken: string): Promise<User> {
    return this.normalizeAnotherUserFields(
      await this.usersRepository.findOne({
        where: { refreshToken },
        relations: [
          'articles',
          'articles.owner',
          'followers',
          'followings',
          'reports',
          'likes',
          'bookmarks',
          'bookmarks.category',
          'bookmarks.owner',
          'selectedCategories',
        ],
      }),
    );
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
