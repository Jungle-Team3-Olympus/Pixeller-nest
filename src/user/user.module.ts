import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member as User } from './entity/user.entity';
import { UserController } from './user.controller';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy } from 'src/auth/AtStrategy';
import { RtStrategy } from 'src/auth/RtStrategy';

@Module({
    imports: [
        JwtModule.register({}), 
        TypeOrmModule.forFeature([User])
    ],
    controllers: [UserController],
    providers: [UserService, AuthService,AtStrategy, RtStrategy],
})
export class UserModule {}
