import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserService } from '../user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
