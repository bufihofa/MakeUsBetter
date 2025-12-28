import { IsString, Length, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({
        description: 'Tên đăng nhập (chỉ chứa chữ cái, số và dấu gạch dưới)',
        example: 'user123',
        minLength: 3,
        maxLength: 20
    })
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username chỉ được chứa chữ cái, số và dấu gạch dưới',
    })
    username: string;

    @ApiProperty({
        description: 'Tên hiển thị',
        example: 'Nguyễn Văn A',
        minLength: 1,
        maxLength: 50
    })
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    name: string;

    @ApiProperty({
        description: 'Mã PIN 6 số',
        example: '123456',
        minLength: 6,
        maxLength: 6
    })
    @IsString()
    @Length(6, 6, { message: 'PIN phải có đúng 6 số' })
    @Matches(/^\d{6}$/, { message: 'PIN phải có đúng 6 số' })
    pin: string;
}
