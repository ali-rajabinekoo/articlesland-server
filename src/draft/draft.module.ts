import { Module } from '@nestjs/common';
import { DraftController } from './draft.controller';
import { DraftService } from './draft.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.AMQP_URL || 'amqp://localhost:5672'],
          queue: 'drafts_queue',
        },
      },
    ]),
  ],
  controllers: [DraftController],
  providers: [DraftService],
})
export class DraftModule {}
