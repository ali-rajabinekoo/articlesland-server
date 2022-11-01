import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { NotificationModule } from '../notification/notification.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), NotificationModule, AdminModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
