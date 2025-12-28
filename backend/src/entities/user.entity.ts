import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Couple } from './couple.entity';
import { Emotion } from './emotion.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: true })
    coupleId: string;

    @ManyToOne(() => Couple, (couple) => couple.users, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'coupleId' })
    couple: Couple;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'text', nullable: true })
    fcmToken: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'boolean', default: false })
    isCreator: boolean;

    @OneToMany(() => Emotion, (emotion) => emotion.user)
    emotions: Emotion[];
}
