import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    uid: number;
    @Column({ length: 50 })
    id: string;
    @Column({ length: 200, nullable: true  })
    pw: string;
    @Column({ length: 10, nullable: true  })
    name: string;
    @Column({ length: 50, nullable: true  })
    email: string;
    @Column({ type: 'char', length: 1, default: 'U' })
    user_type: string; // U: 일반유저, G: 구글유저, K: 카카오 주식좀 올라라
    @CreateDateColumn()
    reg_date: Date;
    @Column({ type: 'datetime', nullable: true })
    last_login: Date;
    @Column({ type: 'float', nullable: true })
    x: number;
    @Column({ type: 'float', nullable: true })
    y: number;
    @Column({ length: 10, nullable: true })
    direction: string;
    @Column({ length: 100, nullable: true })
    api_token: string;
}