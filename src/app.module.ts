import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { Utils } from './libs/utils';
import { Request } from './libs/request';

@Module({
  imports: [AuthModule],
  providers: [Utils, Request],
})
export class AppModule {}
