import { IsString, Length, Matches, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    username: string;

    @IsString()
    @Length(6, 6, { message: 'PIN phải có đúng 6 số' })
    @Matches(/^\d{6}$/, { message: 'PIN phải có đúng 6 số' })
    pin: string;
}
