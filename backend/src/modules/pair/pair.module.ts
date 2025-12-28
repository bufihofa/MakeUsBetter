import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PairController } from './pair.controller';
import { PairService } from './pair.service';
import { Couple, User } from '../../entities';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([Couple, User]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get('JWT_SECRET'),
                signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '30d') },
            }),
        }),
    ],
    controllers: [PairController],
    providers: [PairService],
    exports: [PairService],
})
export class PairModule { }
