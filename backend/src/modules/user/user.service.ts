import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities';
import { UpdateFcmTokenDto } from './dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async updateFcmToken(userId: string, dto: UpdateFcmTokenDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }

        user.fcmToken = dto.fcmToken;
        await this.userRepository.save(user);

        return { success: true };
    }

    async getProfile(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['couple'],
        });

        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }

        return {
            id: user.id,
            name: user.name,
            isCreator: user.isCreator,
            isPaired: user.partner?.id ? true : false,
            createdAt: user.createdAt,
        };
    }
}
