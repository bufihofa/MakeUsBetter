import { IsEnum, IsOptional, IsInt, Min, Max, IsString, MaxLength, IsNotEmpty, Matches, IsUUID } from 'class-validator';
import { EmotionType } from '../../../entities';

export class CreateEmotionDto {
    @IsEnum(EmotionType, { message: 'Loại cảm xúc không hợp lệ' })
    emotionType: EmotionType;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    intensity?: number;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    context?: string;
}

export class CalendarQueryDto {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    partnerId: string;

    @IsString()
    @Matches(/^\d{4}-\d{2}$/, { message: 'Format: YYYY-MM' })
    month: string;
}

export class TodayQueryDto {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    partnerId: string;
}
