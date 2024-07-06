import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member as User } from './entity/user.entity';
import { UserController } from './user.controller';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();
@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '600s' },
        }), 
        TypeOrmModule.forFeature([User])
    ],
    controllers: [UserController],
    providers: [UserService, AuthService],
})
export class UserModule {}
