import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { EmotionService } from './emotion.service';
import { CreateEmotionDto, CalendarQueryDto, TodayQueryDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('emotions')
@UseGuards(JwtAuthGuard)
export class EmotionController {
    constructor(private readonly emotionService: EmotionService) { }

    @Post()
    async createEmotion(
        @CurrentUser('userId') userId: string,
        @Body() dto: CreateEmotionDto,
    ) {
        return this.emotionService.createEmotion(userId, dto);
    }

    @Get('calendar')
    async getCalendar(@Query() query: CalendarQueryDto) {
        return this.emotionService.getCalendarData(query.partnerId, query.month);
    }

    @Get('today')
    async getTodayEmotions(@Query() query: TodayQueryDto) {
        return this.emotionService.getTodayEmotions(query.partnerId);
    }
}
