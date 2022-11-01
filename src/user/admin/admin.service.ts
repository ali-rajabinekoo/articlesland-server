import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { Repository } from 'typeorm';
import { adminInfo } from '../../libs/config';
import { UserResDtoForAdmin } from '../user.dto';
import utils from '../../libs/utils';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    this.adminChecker().catch((e) => {
      console.log('[X] Admin checking failed: ', e);
      process.exit(1);
    });
  }

  private adminChecker = async () => {
    const admin: User = await this.usersRepository.findOneBy({ role: 'admin' });
    if (!admin) {
      const newAdmin: User = await this.usersRepository.create(adminInfo);
      await this.usersRepository.save(newAdmin);
    }
  };

  syncIsBlocked = async (
    data: User | User[],
    isBlocked?: boolean,
  ): Promise<UserResDtoForAdmin | UserResDtoForAdmin[]> => {
    if (data instanceof Array) {
      return Promise.all(
        (
          await Promise.all(
            data.map(async (el: User) => {
              if (isBlocked === undefined) return el;
              const fetchedIsBlocked: boolean =
                await utils.admin.checkIsBlocked(el.id);
              return fetchedIsBlocked === isBlocked ? el : null;
            }),
          )
        )
          .filter((el) => Boolean(el))
          .map(
            async (el: User) =>
              new UserResDtoForAdmin(el, {
                isBlocked: await utils.admin.checkIsBlocked(el.id),
              }),
          ),
      );
    }
    return new UserResDtoForAdmin(data, {
      isBlocked: await utils.admin.checkIsBlocked(data.id),
    });
  };
}
