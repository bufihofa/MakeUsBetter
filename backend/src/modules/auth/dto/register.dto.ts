import { IsString, Length, Matches, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username chỉ được chứa chữ cái, số và dấu gạch dưới',
    })
    username: string;

    @IsString()
    @MinLength(1)
    @MaxLength(50)
    name: string;

    @IsString()
    @Length(6, 6, { message: 'PIN phải có đúng 6 số' })
    @Matches(/^\d{6}$/, { message: 'PIN phải có đúng 6 số' })
    pin: string;
}
