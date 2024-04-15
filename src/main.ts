import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exceptionHandler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //app.useGlobalFilters(new HttpExceptionFilter())
  //app.useGlobalPipes(new ValidationPipe({transform: true,whitelist:true}));
  await app.listen(3000);
}
bootstrap();
