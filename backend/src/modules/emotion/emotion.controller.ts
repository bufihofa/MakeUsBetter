import { Controller, Post, Get, Body, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmotionService } from './emotion.service';
import { CreateEmotionDto, CalendarQueryDto, TodayQueryDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('Emotions')
@ApiBearerAuth('JWT-auth')
@Controller('emotions')
@UseGuards(JwtAuthGuard)
export class EmotionController {
    constructor(
        private readonly emotionService: EmotionService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Tạo cảm xúc mới', description: 'Ghi nhận cảm xúc của người dùng hiện tại' })
    @ApiBody({ type: CreateEmotionDto })
    @ApiResponse({ status: 201, description: 'Tạo cảm xúc thành công' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực' })
    async createEmotion(
        @CurrentUser('userId') userId: string,
        @Body() dto: CreateEmotionDto,
    ) {
        return this.emotionService.createEmotion(userId, dto);
    }

    @Post('with-voice')
    @UseInterceptors(FileInterceptor('voice'))
    @ApiOperation({ summary: 'Tạo cảm xúc với voice', description: 'Ghi nhận cảm xúc kèm tin nhắn thoại' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 201, description: 'Tạo cảm xúc thành công' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực' })
    async createEmotionWithVoice(
        @CurrentUser('userId') userId: string,
        @UploadedFile() voice: Express.Multer.File,
        @Body() dto: CreateEmotionDto,
    ) {
        // Upload voice to Cloudinary if provided
        if (voice) {
            const voiceUrl = await this.cloudinaryService.uploadVoice(voice);
            dto.voiceUrl = voiceUrl || undefined;
        }

        return this.emotionService.createEmotion(userId, dto);
    }

    @Get('calendar')
    @ApiOperation({ summary: 'Lấy dữ liệu lịch cảm xúc', description: 'Lấy tổng hợp cảm xúc theo tháng của partner' })
    @ApiQuery({ name: 'partnerId', description: 'ID của partner' })
    @ApiQuery({ name: 'month', description: 'Tháng cần lấy (format: YYYY-MM)' })
    @ApiResponse({ status: 200, description: 'Trả về dữ liệu lịch cảm xúc' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực' })
    async getCalendar(@Query() query: CalendarQueryDto) {
        return this.emotionService.getCalendarData(query.partnerId, query.month);
    }

    @Get('today')
    @ApiOperation({ summary: 'Lấy cảm xúc hôm nay', description: 'Lấy danh sách cảm xúc hôm nay của partner' })
    @ApiQuery({ name: 'partnerId', description: 'ID của partner' })
    @ApiResponse({ status: 200, description: 'Trả về danh sách cảm xúc hôm nay' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực' })
    async getTodayEmotions(@Query() query: TodayQueryDto) {
        return this.emotionService.getTodayEmotions(query.partnerId);
    }
}

