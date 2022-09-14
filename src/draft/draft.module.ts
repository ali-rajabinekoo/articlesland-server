import { Module } from '@nestjs/common';
import { DraftController } from './draft.controller';
import { DraftService } from './draft.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { rabbitmqUrl } from '../libs/config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [rabbitmqUrl],
          queue: 'drafts_queue',
        },
      },
    ]),
  ],
  controllers: [DraftController],
  providers: [DraftService],
})
export class DraftModule {}
