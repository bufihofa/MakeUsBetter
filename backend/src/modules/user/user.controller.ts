import { Controller, Put, Get, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateFcmTokenDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Put('fcm-token')
    async updateFcmToken(
        @CurrentUser('userId') userId: string,
        @Body() dto: UpdateFcmTokenDto,
    ) {
        return this.userService.updateFcmToken(userId, dto);
    }

    @Get('profile')
    async getProfile(@CurrentUser('userId') userId: string) {
        return this.userService.getProfile(userId);
    }
}
