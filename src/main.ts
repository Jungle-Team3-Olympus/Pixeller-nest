import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:3000', 'http://192.168.0.109:3000', 'http://192.168.0.145:3000', 'http://192.168.0.103:3000', 'http://192.168.0.100:3000'], // 원하는 도메인
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // 허용할 HTTP 메서드
    credentials: true, // 클라이언트에서 인증정보(Cookie 등)를 전송할 수 있도록 설정
  });

  // 전역 파이프 설정
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3333);
}
bootstrap();
