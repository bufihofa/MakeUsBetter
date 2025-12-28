import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateFcmTokenDto {
    @IsString()
    @IsNotEmpty({ message: 'FCM token không được để trống' })
    fcmToken: string;
}
