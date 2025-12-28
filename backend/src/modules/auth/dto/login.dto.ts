import { IsString, Length, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        description: 'Tên đăng nhập',
        example: 'user123',
        minLength: 3,
        maxLength: 20
    })
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    username: string;

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
