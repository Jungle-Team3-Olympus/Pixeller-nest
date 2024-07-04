import { Module } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member as User } from '../user/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { AtStrategy } from 'src/auth/AtStrategy';
import { RtStrategy } from 'src/auth/RtStrategy';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';

dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '600s' },
    }),
    PassportModule,
  ],
  providers: [AuthService,AtStrategy, RtStrategy, UserService, ChatGateway],
})
export class ChatModule {}
