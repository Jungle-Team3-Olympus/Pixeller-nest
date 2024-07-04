import { Body, Controller, Post, Res } from '@nestjs/common';
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
        const result: User = await this.userService.findOne(user.user);
        if (user.user.user_type != 'G'){
            if (result === null){
                return {msg:'User not found'};
            }
            const payload = {
                uid: result.member_id,
                id: result.id,
                username: result.username,
                email: result.email,
                user_type: result.user_type,
                x: result.x,
                y: result.y,
                direction: result.direction,
            }
            const refreshToken = this.authService.setRefreshToken({user:payload, res});
            const jwt = this.authService.getAccessToken({user:payload});
            const returnJson = { msg:'Ok', user: payload, jwt: jwt, refreshToken: refreshToken};
            return res.status(200).json(returnJson);
        }else{
            if (result === null) {
                return { msg:'G Id Join Ok', user: this.userService.create(user.user) };    
            }
            return { msg:'Ok', user: result };
        }
        
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

    // @Post('refresh')
    // @UseGuards(AuthGuard('jwt-refresh'))
    // async refreshToken(@Req() req: Request, @Res() res: Response) {
    // const { refreshToken, sub, email } = req.user as JwtPayload & {
    //     refreshToken: string;
    // };

    // const user = await this.userService.findByIdAndCheckRT(sub, refreshToken);

    // const token = this.authService.getToken({ sub, email });

    // res.cookie('access-token', token.accessToken);
    // res.cookie('refresh-token', token.refreshToken);

    // await this.userService.updateHashedRefreshToken(user.id, refreshToken);

    // res.redirect('/');
    // }

}
