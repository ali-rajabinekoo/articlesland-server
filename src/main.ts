import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { clearingKeyvScheduler } from './libs/cronjob';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  clearingKeyvScheduler.start();
  await app.listen(8080);
}

bootstrap();
