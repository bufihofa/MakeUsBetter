import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFcmTokenDto {
    @ApiProperty({
        description: 'Firebase Cloud Messaging token để nhận thông báo',
        example: 'fcm-token-example-abc123...'
    })
    @IsString()
    @IsNotEmpty({ message: 'FCM token không được để trống' })
    fcmToken: string;
}
