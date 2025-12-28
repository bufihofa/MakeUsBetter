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
            textMessage: dto.textMessage,
            voiceUrl: dto.voiceUrl,
        });
        await this.emotionRepository.save(emotion);

        // Send notification to partner
        const partner = await this.pairService.getPartnerByUserId(userId);
        if (partner?.fcmToken) {
            const emoji = this.getEmotionEmoji(dto.emotionType);
            const emotionName = this.getEmotionVietnamese(dto.emotionType);

            // Build notification body
            let body = `Cường độ: ${dto.intensity || 50}%`;
            if (dto.textMessage) {
                body = `"${dto.textMessage}"`;
            }
            if (dto.voiceUrl) {
                body = dto.textMessage ? `${body} 🎤` : '🎤 Có tin nhắn thoại';
            }

            await this.notificationService.sendNotification(partner.fcmToken, {
                title: `${user.name} đang ${emotionName} ${emoji}`,
                body,
                imageUrl: user.avatarUrl,
                data: {
                    type: 'emotion',
                    emotionType: dto.emotionType,
                    userId: userId,
                    emotionId: emotion.id,
                    textMessage: dto.textMessage || '',
                    voiceUrl: dto.voiceUrl || '',
                },
            });
        }

        return {
            success: true,
            emotionId: emotion.id,
        };
    }

    private getVietnamDate(date: Date): Date {
        return new Date(date.getTime() + 7 * 60 * 60 * 1000);
    }

    async getEmotionsByDate(userId: string, date: Date) {
        const vnDate = this.getVietnamDate(date);

        // Construct YYYY-MM-DD string for Vietnam time
        const year = vnDate.getUTCFullYear();
        const month = String(vnDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(vnDate.getUTCDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Create range in UTC that corresponds to VN day
        const startOfDay = new Date(`${dateStr}T00:00:00+07:00`);
        const endOfDay = new Date(`${dateStr}T23:59:59.999+07:00`);

        const emotions = await this.emotionRepository.find({
            where: {
                userId,
                createdAt: Between(startOfDay, endOfDay),
            },
            order: { createdAt: 'ASC' },
        });

        return emotions.map((e) => {
            const vnTime = this.getVietnamDate(e.createdAt);
            const timeStr = vnTime.toISOString().split('T')[1].substring(0, 5);

            return {
                id: e.id,
                type: e.emotionType,
                intensity: e.intensity,
                textMessage: e.textMessage,
                voiceUrl: e.voiceUrl,
                time: timeStr,
                createdAt: e.createdAt,
            };
        });
    }

    async getCalendarData(partnerId: string, month: string) {
        // month format: "YYYY-MM"
        // Calculate range for the month in VN time (UTC+7)
        const startDate = new Date(`${month}-01T00:00:00+07:00`);

        // Find end of month
        const [year, monthNum] = month.split('-').map(Number);
        // Create date for 1st of next month in VN time, then minus 1ms
        // Or easier: construct end date based on days in month
        // new Date(y, m, 0).getDate() gives days in month
        const daysInMonth = new Date(year, monthNum, 0).getDate();
        const endDate = new Date(`${month}-${daysInMonth}T23:59:59.999+07:00`);

        const emotions = await this.emotionRepository.find({
            where: {
                userId: partnerId,
                createdAt: Between(startDate, endDate),
            },
            order: { createdAt: 'ASC' },
        });

        // Group by date (VN date)
        const grouped: Record<string, { type: string; time: string; intensity: number; textMessage?: string; voiceUrl?: string }[]> = {};

        for (const emotion of emotions) {
            const vnDate = this.getVietnamDate(emotion.createdAt);
            const dateKey = vnDate.toISOString().split('T')[0]; // correct date in VN
            const timeStr = vnDate.toISOString().split('T')[1].substring(0, 5); // correct time in VN

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push({
                type: emotion.emotionType,
                time: timeStr,
                intensity: emotion.intensity,
                textMessage: emotion.textMessage || undefined,
                voiceUrl: emotion.voiceUrl || undefined,
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
