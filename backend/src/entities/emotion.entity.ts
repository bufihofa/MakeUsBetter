import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum EmotionType {
    JOY = 'joy',
    TRUST = 'trust',
    FEAR = 'fear',
    SURPRISE = 'surprise',
    SADNESS = 'sadness',
    DISGUST = 'disgust',
    ANGER = 'anger',
    ANTICIPATION = 'anticipation',
}

@Entity('emotions')
export class Emotion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @ManyToOne(() => User, (user) => user.emotions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'enum', enum: EmotionType })
    emotionType: EmotionType;

    @Column({ type: 'integer', default: 50 })
    intensity: number; // 1-100

    @Column({ type: 'varchar', length: 500, nullable: true })
    textMessage: string;

    @Column({ type: 'text', nullable: true })
    voiceUrl: string;

    @CreateDateColumn()
    createdAt: Date;
}
