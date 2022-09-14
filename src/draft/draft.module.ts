import { Module } from '@nestjs/common';
import { DraftController } from './draft.controller';
import { DraftService } from './draft.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { rabbitmqUrl } from '../libs/config';
import { ArticleModule } from '../article/article.module';

@Module({
  imports: [
    ArticleModule,
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
