import { Body, Controller, Header, Headers, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { Member as User } from './entity/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { Response } from 'express';

@Controller('user')
export class UserController {
    constructor( 
        private readonly userService: UserService,
        private readonly authService: AuthService
    ) {}

    @Post('/login')
    async login(@Body() user: {user:User}, @Res() res:Response){
        let result: User = await this.userService.findOne(user.user);
        let createYn = false;
        if (result === null){
            if(user.user.user_type === 'G'){
                result = await this.userService.create(user.user);
                createYn = true;
            }else{
                return res.status(200).json({msg:'User not found'});
            }
        }
        const payload = {
            uid: result.member_id,
            id: result.id,
            username: result.id,
            email: result.email,
            user_type: result.user_type,
            x: result.x,
            y: result.y,
            direction: result.direction,
        };
        const refreshToken = this.authService.setRefreshToken({user:payload, res});
        const jwt = this.authService.getAccessToken({user:payload});
        this.userService.updateHashedRefreshToken(result.member_id, refreshToken);
        const returnJson = { msg:'Ok', user: payload, jwt: jwt, refreshToken: refreshToken, createYn: createYn};
        
        return res.status(200).json(returnJson);    
    }
    
    @Post('/create')
    async create(@Body() user: {user:User}) {
        const result: User = await this.userService.duplicateId(user.user);
        if (result !== null){
            return {msg : 'Duplicated Id'};
        }
        const result_user = await this.userService.create(user.user);
        if(result_user === null){
            return {msg:'Fail'};
        }
        
        return { msg:'Ok', user: result_user };
    }

    @Post('refresh')
    async refreshToken(@Headers('Authorization') auth:string ,@Body() refreshToken: any, @Res() res: Response) {
        const token = auth.split(' ')[1];
        const payload = this.authService.decodeToken(token);

        const result = await this.userService.validateRefreshToken(payload.uid, refreshToken.refreshToken);
        if(result.result){
            const payload = {
                uid: result.user.member_id,
                id: result.user.id,
                username: result.user.id,
                email: result.user.email,
                user_type: result.user.user_type,
                x: result.user.x,
                y: result.user.y,
                direction: result.user.direction,
            };
            const refreshToken = this.authService.setRefreshToken({user:payload, res});
            const jwt = this.authService.getAccessToken({user:payload});
            this.userService.updateHashedRefreshToken(result.user.member_id, refreshToken);
            return res.status(200).json({msg:'Token refresh is done',jwt: jwt, refreshToken: refreshToken}); 
        }else{
            res.setHeader('Location', '/');
            return res.redirect(307, '/'); 
        }
        
    }

}
