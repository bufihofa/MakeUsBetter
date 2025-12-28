import { IsEnum, IsOptional, IsInt, Min, Max, IsString, MaxLength, IsNotEmpty, Matches, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmotionType } from '../../../entities';

export class CreateEmotionDto {
    @ApiProperty({
        description: 'Loại cảm xúc',
        enum: EmotionType,
        example: 'HAPPY'
    })
    @IsEnum(EmotionType, { message: 'Loại cảm xúc không hợp lệ' })
    emotionType: EmotionType;

    @ApiPropertyOptional({
        description: 'Mức độ cảm xúc (1-100)',
        minimum: 1,
        maximum: 100,
        example: 80
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    intensity?: number;

    @ApiPropertyOptional({
        description: 'Ngữ cảnh hoặc ghi chú',
        maxLength: 100,
        example: 'Vui vì được gặp mặt'
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    context?: string;
}

export class CalendarQueryDto {
    @ApiProperty({
        description: 'ID của partner',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    partnerId: string;

    @ApiProperty({
        description: 'Tháng cần lấy dữ liệu (format: YYYY-MM)',
        example: '2024-01'
    })
    @IsString()
    @Matches(/^\d{4}-\d{2}$/, { message: 'Format: YYYY-MM' })
    month: string;
}

export class TodayQueryDto {
    @ApiProperty({
        description: 'ID của partner',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    partnerId: string;
}
