import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { clearingKeyValueDatabaseScheduler } from './libs/cronjob';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('ArticlesLand')
    .setDescription('The ArticlesLand API description')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('user')
    .addTag('article')
    .addTag('category')
    .addTag('comment')
    .addTag('draft')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  process.env.TZ = 'Asia/Tehran';

  clearingKeyValueDatabaseScheduler.start();
  await app.listen(8080);
}

bootstrap().catch((e) => {
  console.log(e);
  process.exit(1);
});
