import crypto from 'crypto';
import { Member as User } from 'src/user/entity/user.entity';
import util from "util";

const salt = 'namanmu3team';
export function cryptoPw (user:User){
    let cryptoPw = null;
    crypto.pbkdf2(user.pw, salt, 25, 12, 'sha512', (err,key) => {
        cryptoPw = key.toString('base64');
    });
    return cryptoPw;
} 