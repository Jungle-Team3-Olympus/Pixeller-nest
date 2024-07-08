import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member as User } from './entity/user.entity';
import { cryptoPw } from '../util/cryptoHandler';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) {}

    async findOne(user: User): Promise<User> {
        if (user.user_type === 'G') 
            return await this.usersRepository.findOne({ where: { google_identity: user.google_identity } });
        else{
            user.pw = await cryptoPw(user);
            return await this.usersRepository.findOne({ where: { id: user.id, pw:user.pw } });
        }
    }

    async duplicateId(user: User): Promise<User> {
        if(user.user_type === 'G'){
            return await this.usersRepository.findOne({ where: { google_identity: user.google_identity } });
        }else{
            return await this.usersRepository.findOne({ where: { id: user.id } });
        }
    }

    async create(user: User): Promise<User> {
        const result = await this.duplicateId(user);
        if (result !== null) throw new ConflictException('this ID already been created');
        // await this.usersRepository.insert(user);
        console.log()
        if(user.pw !== null && user.pw !== undefined ){
            user.pw = await cryptoPw(user);
        }
        const checks = ['id','pw','user_type', 'joined_at', 'last_login'];
        this.checkValidator(user, checks);
        await this.usersRepository.save(user);
        // await this.usersRepository.createQueryBuilder()
        //     .insert()
        //     .into(User,checks)
        //     .values(user)
        //     .execute();   
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
                    if (user.joined_at === undefined)
                        user.joined_at = new Date();
                    break;
                case 'last_login':
                    if (user.last_login === undefined) 
                        user.last_login = new Date();
                    break;
            } 
        }
    }

    async getUserPosition(member_id: number): Promise<User> {
        return await this.usersRepository.findOne({ 
            where: { member_id: member_id },
            select: ['x', 'y', 'direction', 'username']  
        });
    }

    async setUserPosition(memberId: string, x: number, y: number): Promise<void> {
        await this.usersRepository.update(memberId, { x:x, y:y });
    }

    async updateHashedRefreshToken(memberId: number, refreshToken: string): Promise<void> {
        console.log('updateHashedRefreshToken', memberId, ':',refreshToken);
        await this.usersRepository.update(memberId, { api_token: refreshToken });
    }

    async validateRefreshToken(memberId: number, refreshToken: string): Promise<any> {
        const user = await this.usersRepository.findOne({ where: { member_id: memberId, api_token: refreshToken } });
        if(user === null) return { result:false };
        return { result:true, user:user };
    }

}
