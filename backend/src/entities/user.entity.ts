import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Emotion } from './emotion.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 6, nullable: true })
    pairCode: string;

    @OneToOne(() => User, { nullable: true })
    @JoinColumn()
    partner: User;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
    username: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    pinHash: string;

    @Column({ type: 'text', nullable: true })
    fcmToken: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'boolean', default: false })
    isCreator: boolean;

    @OneToMany(() => Emotion, (emotion) => emotion.user)
    emotions: Emotion[];
}
