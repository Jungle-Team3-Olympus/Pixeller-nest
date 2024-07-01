import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async findOne(user: User): Promise<User> {
        if (user.user_type === 'G') 
            return await this.usersRepository.findOne({ where: { id: user.id } });
        else
            return await this.usersRepository.findOne({ where: { id: user.id, pw:user.pw } });
    }

    async create(user: User): Promise<User> {
        const result = await this.findOne(user);
        if (result !== null) throw new ConflictException('this ID already been created');
        // await this.usersRepository.insert(user);
        const checks = ['id','pw','user_type', 'reg_date', 'last_login'];
        this.checkValidator(user, checks);
        
        await this.usersRepository.createQueryBuilder()
            .insert()
            .into(User,checks)
            .values(user)
            .execute();   
        return await this.findOne(user);
    }

    checkValidator(user: User, checks: string[]){
        for (const check of checks) {
            switch (check) {
                case 'id':
                    if (user.id === undefined) 
                        user.id = null;
                    break;
                case 'pw':
                    if (user.pw === undefined)
                        user.pw = null;
                    break;
                case 'user_type':
                    if (user.user_type === undefined)
                        user.user_type = 'U';
                    break;
                case 'reg_date':
                    if (user.reg_date === undefined)
                        user.reg_date = new Date();
                    break;
                case 'last_login':
                    if (user.last_login === undefined) 
                        user.last_login = new Date();
                    break;
            } 
        }
    }

}
