import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiProperty } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

class SendNotificationDto {
    @ApiProperty({
        description: 'Title of the notification',
        example: 'Hello',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'Body of the notification',
        example: 'This is a test notification',
    })
    @IsString()
    @IsNotEmpty()
    body: string;

    @ApiProperty({
        description: 'Data to be sent with the notification',
        example: '{ "type": "test", "timestamp": "2024-01-01T00:00:00.000Z" }',
    })
    @IsObject()
    @IsNotEmpty()
    data?: Record<string, string>;
}

@ApiTags('Debug - Notification')
@Controller('debug/notification')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    @Post('send/:userId')
    @ApiOperation({ summary: 'Send notification to a specific user (Debug)' })
    @ApiParam({ name: 'userId', description: 'User ID to send notification to' })
    @ApiBody({ type: SendNotificationDto })
    async sendToUser(
        @Param('userId') userId: string,
        @Body() dto: SendNotificationDto,
    ) {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        if (!user.fcmToken) {
            return { success: false, error: 'User does not have FCM token registered' };
        }

        const result = await this.notificationService.sendNotification(user.fcmToken, {
            title: dto.title,
            body: dto.body,
            data: dto.data,
        });

        return {
            success: result,
            userId: user.id,
            userName: user.name,
            hasFcmToken: !!user.fcmToken,
        };
    }

    @Get('users')
    @ApiOperation({ summary: 'List all users with their FCM token status (Debug)' })
    async listUsers() {
        const users = await this.userRepository.find({
            select: ['id', 'name', 'username', 'fcmToken'],
        });

        return users.map((user) => ({
            id: user.id,
            name: user.name,
            username: user.username,
            hasFcmToken: !!user.fcmToken,
            fcmTokenPreview: user.fcmToken ? `${user.fcmToken.substring(0, 20)}...` : null,
        }));
    }

    @Post('send-test/:userId')
    @ApiOperation({ summary: 'Send a test notification to a user (Debug)' })
    @ApiParam({ name: 'userId', description: 'User ID to send test notification to' })
    async sendTestNotification(@Param('userId') userId: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        if (!user.fcmToken) {
            return { success: false, error: 'User does not have FCM token registered' };
        }

        const result = await this.notificationService.sendNotification(user.fcmToken, {
            title: '🧪 Test Notification',
            body: `Hello ${user.name}! This is a test notification from MakeUsBetter.`,
            data: { type: 'test', timestamp: new Date().toISOString() },
        });

        return {
            success: result,
            userId: user.id,
            userName: user.name,
            sentAt: new Date().toISOString(),
        };
    }
}
