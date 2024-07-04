import { Module } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member as User } from '../user/entity/user.entity';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [ChatGateway, UserService]
})
export class ChatModule {}
