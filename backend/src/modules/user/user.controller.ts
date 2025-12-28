import { Controller, Put, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateFcmTokenDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('User')
@ApiBearerAuth('JWT-auth')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Put('fcm-token')
    @ApiOperation({ summary: 'Cập nhật FCM token', description: 'Cập nhật token Firebase Cloud Messaging để nhận thông báo' })
    @ApiBody({ type: UpdateFcmTokenDto })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực' })
    async updateFcmToken(
        @CurrentUser('userId') userId: string,
        @Body() dto: UpdateFcmTokenDto,
    ) {
        return this.userService.updateFcmToken(userId, dto);
    }

    @Get('profile')
    @ApiOperation({ summary: 'Lấy thông tin profile', description: 'Lấy thông tin cá nhân của người dùng hiện tại' })
    @ApiResponse({ status: 200, description: 'Trả về thông tin profile' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực' })
    async getProfile(@CurrentUser('userId') userId: string) {
        return this.userService.getProfile(userId);
    }
}
