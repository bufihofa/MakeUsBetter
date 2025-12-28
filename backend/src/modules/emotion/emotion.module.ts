import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmotionController } from './emotion.controller';
import { EmotionService } from './emotion.service';
import { Emotion, User } from '../../entities';
import { NotificationModule } from '../notification/notification.module';
import { PairModule } from '../pair/pair.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Emotion, User]),
        NotificationModule,
        PairModule,
    ],
    controllers: [EmotionController],
    providers: [EmotionService],
    exports: [EmotionService],
})
export class EmotionModule { }
