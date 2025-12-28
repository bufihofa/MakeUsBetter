import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreatePairDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @MinLength(1)
    @MaxLength(100)
    name: string;
}

export class JoinPairDto {
    @IsString()
    @IsNotEmpty({ message: 'Mã ghép cặp không được để trống' })
    @MinLength(6)
    @MaxLength(6)
    pairCode: string;

    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @MinLength(1)
    @MaxLength(100)
    name: string;
}
