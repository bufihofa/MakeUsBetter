import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Emotion, EmotionType, User } from '../../entities';
import { CreateEmotionDto } from './dto';
import { NotificationService } from '../notification/notification.service';
import { PairService } from '../pair/pair.service';

@Injectable()
export class EmotionService {
    constructor(
        @InjectRepository(Emotion)
        private emotionRepository: Repository<Emotion>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private notificationService: NotificationService,
        private pairService: PairService,
    ) { }

    private getEmotionEmoji(type: EmotionType): string {
        const emojiMap: Record<EmotionType, string> = {
            [EmotionType.JOY]: '😊',
            [EmotionType.TRUST]: '🤝',
            [EmotionType.FEAR]: '😨',
            [EmotionType.SURPRISE]: '😲',
            [EmotionType.SADNESS]: '😢',
            [EmotionType.DISGUST]: '🤢',
            [EmotionType.ANGER]: '😠',
            [EmotionType.ANTICIPATION]: '🤩',
        };
        return emojiMap[type] || '💭';
    }

    private getEmotionVietnamese(type: EmotionType): string {
        const nameMap: Record<EmotionType, string> = {
            [EmotionType.JOY]: 'vui vẻ',
            [EmotionType.TRUST]: 'tin tưởng',
            [EmotionType.FEAR]: 'sợ hãi',
            [EmotionType.SURPRISE]: 'ngạc nhiên',
            [EmotionType.SADNESS]: 'buồn bã',
            [EmotionType.DISGUST]: 'khó chịu',
            [EmotionType.ANGER]: 'tức giận',
            [EmotionType.ANTICIPATION]: 'mong đợi',
        };
        return nameMap[type] || type;
    }

    async createEmotion(userId: string, dto: CreateEmotionDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }

        // Create emotion
        const emotion = this.emotionRepository.create({
            userId,
            emotionType: dto.emotionType,
            intensity: dto.intensity || 50,
            context: dto.context,
        });
        await this.emotionRepository.save(emotion);

        // Send notification to partner
        const partner = await this.pairService.getPartnerByUserId(userId);
        if (partner?.fcmToken) {
            const emoji = this.getEmotionEmoji(dto.emotionType);
            const emotionName = this.getEmotionVietnamese(dto.emotionType);

            await this.notificationService.sendNotification(partner.fcmToken, {
                title: `${user.name} đang ${emotionName} ${emoji}`,
                body: dto.context
                    ? `"${dto.context}" - Cường độ: ${dto.intensity || 50}%`
                    : `Cường độ: ${dto.intensity || 50}%`,
                imageUrl: user.avatarUrl, // Avatar của người gửi
                data: {
                    type: 'emotion',
                    emotionType: dto.emotionType,
                    userId: userId,
                    emotionId: emotion.id,
                },
            });
        }

        return {
            success: true,
            emotionId: emotion.id,
        };
    }

    async getEmotionsByDate(userId: string, date: Date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const emotions = await this.emotionRepository.find({
            where: {
                userId,
                createdAt: Between(startOfDay, endOfDay),
            },
            order: { createdAt: 'ASC' },
        });

        return emotions.map((e) => ({
            id: e.id,
            type: e.emotionType,
            intensity: e.intensity,
            context: e.context,
            time: e.createdAt.toTimeString().slice(0, 5),
            createdAt: e.createdAt,
        }));
    }

    async getCalendarData(partnerId: string, month: string) {
        // Parse month (format: "2024-12")
        const [year, monthNum] = month.split('-').map(Number);

        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

        const emotions = await this.emotionRepository.find({
            where: {
                userId: partnerId,
                createdAt: Between(startDate, endDate),
            },
            order: { createdAt: 'ASC' },
        });

        // Group by date
        const grouped: Record<string, { type: string; time: string; intensity: number; context?: string }[]> = {};

        for (const emotion of emotions) {
            const dateKey = emotion.createdAt.toISOString().split('T')[0];
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push({
                type: emotion.emotionType,
                time: emotion.createdAt.toTimeString().slice(0, 5),
                intensity: emotion.intensity,
                context: emotion.context || undefined,
            });
        }

        return {
            emotions: Object.entries(grouped).map(([date, emotions]) => ({
                date,
                emotions,
            })),
        };
    }

    async getTodayEmotions(partnerId: string) {
        const today = new Date();
        return this.getEmotionsByDate(partnerId, today);
    }
}
