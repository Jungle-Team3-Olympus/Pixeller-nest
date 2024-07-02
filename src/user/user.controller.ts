import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { Member as User } from './entity/user.entity';

@Controller('user')
export class UserController {
    constructor( private readonly userService: UserService ) {}

    @Post('/login')
    async login(@Body() user: {user:User}) {
        const result: User = await this.userService.findOne(user.user);
        if (user.user.user_type != 'G'){
            if (result === null){
                return {msg:'User not found'};
            }
        }else{
            if (result === null) {
                return { msg:'G Id Join Ok', user: this.userService.create(user.user) };    
            }
        }
        
        return { msg:'Ok', user: result };
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

}
