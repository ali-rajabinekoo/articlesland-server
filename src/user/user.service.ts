import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterNewUserDto, UserUniqueInfoDto } from './user.dto';
import { User } from './user.entity';

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

  async addNewUser(body: RegisterNewUserDto): Promise<User> {
    const user = await this.usersRepository.create(body);
    await this.usersRepository.save(user);
    return user;
  }
}
