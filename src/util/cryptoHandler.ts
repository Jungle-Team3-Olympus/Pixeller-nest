import * as crypto from 'crypto';
import { Member as User } from 'src/user/entity/user.entity';
import util from "util";

const salt = 'namanmu3team';
export function cryptoPw (user:User): Promise<string> {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(user.pw, salt, 100000, 64, 'sha512', (err, key) => {
            if (err) reject(err);
            resolve(key.toString('base64'));
        });
    });    
} 