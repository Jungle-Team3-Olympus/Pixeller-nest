import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { IoAdapter } from '@nestjs/platform-socket.io';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // WebSocket 어댑터 설정
  app.useWebSocketAdapter(new IoAdapter(app));
  
  // 전역 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
    
  // CORS 설정
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://pixeller.net', 'http://pixeller.net'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  // Socket.IO 특정 CORS 설정
  const ioAdapter = new IoAdapter(app);
  ioAdapter.createIOServer(Number(process.env.PORT) || 3333, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://pixeller.net', 'http://pixeller.net'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // express.raw() 설정 -> openvidu webhook
  app.use(express.raw({ type: 'application/webhook+json' }));

  // 서버 시작
  const port = process.env.PORT || 3333;
  await app.listen(port);
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
});