import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService
    ) {
        console.log( process.env );
    }
    
    // Aceess Token 생성
    getAccessToken({ user }): string {
        return this.jwtService.sign({ 
            sub: user.id, 
            uid: user.uid,
            id: user.id,
            username: user.username,
            email: user.email,
            user_type: user.user_type,
            x: user.x,
            y: user.y,
            direction: user.direction,
        },
        {
            secret: process.env.JWT_SECRET,
            expiresIn: '30d',
        }
        );

    }
    setRefreshToken({ user, res }) {
        const refreshToken = this.jwtService.sign(
        {
            sub: user.id, 
            uid: user.uid,
            id: user.id,
            username: user.username,
            email: user.email,
            user_type: user.user_type,
            x: user.x,
            y: user.y,
            direction: user.direction,
        },
        {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '2w',
        },
        );
        // 배포환경에서는 쿠키 보안옵션과 CORS 추가해주어야함 
        // 그래도 안되어서 화면단에서 쿠키에 추가하도록 수정함
        // res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; Path=/; HttpOnly; SameSite=None; Secure;`);
        // res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; Path=/;  SameSite=None; Secure; Domain=http://localhost;`);
        return refreshToken;
    }

    validateAccessToken(token: string) {
        const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
        return payload.exp * 1000 < Date.now() ? false : true;
    }

    decodeToken(token: string) {
        return this.jwtService.decode(token);
    }

}
