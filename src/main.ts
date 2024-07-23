import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { IoAdapter } from '@nestjs/platform-socket.io';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true, // DTO에 없는 값은 거르고 에러메세지 출력
      // forbidNonWhitelisted: true, // DTO에 존재하지않는 값이 들어오면 에러메세지출력
      transform: true,
    }),
  );
    
  app.enableCors({
    origin: ['*'], // 원하는 도메인
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 허용할 HTTP 메서드
    credentials: true, // 클라이언트에서 인증정보(Cookie 등)를 전송할 수 있도록 설정
    // exposedHeaders: ['set-cookie'], // 클라이언트에서 접근 가능한 헤더
  });

  // express.raw() 설정 -> openvidu webhook
  app.use(express.raw({ type: 'application/webhook+json' }));

  // app.useGlobalInterceptors(new CorsInterceptor());

  await app.listen(3333);
}
bootstrap();
