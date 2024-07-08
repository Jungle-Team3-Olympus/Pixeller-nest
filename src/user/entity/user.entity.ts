import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Member {
    @PrimaryGeneratedColumn()
    member_id: number;
    @Column({ length: 50 })
    id: string;
    @Column({ length: 200, nullable: true  })
    pw: string;
    @Column({ length: 10, nullable: true  })
    username: string;
    @Column({ length: 50, nullable: true  })
    email: string;
    @Column({ type: 'char', length: 1, default: 'U' })
    user_type: string; // U: 일반유저, G: 구글유저, K: 카카오 주식좀 올라라
    @CreateDateColumn()
    joined_at: Date;
    @Column({ type: 'datetime', nullable: true })
    last_login: Date;
    @Column({ type: 'float', nullable: true })
    x: number;
    @Column({ type: 'float', nullable: true })
    y: number;
    @Column({ length: 10, nullable: true })
    direction: string;
    @Column({ length: 1000, nullable: true })
    api_token: string;
    @Column({ length: 100, nullable: true })
    google_identity: string;
}