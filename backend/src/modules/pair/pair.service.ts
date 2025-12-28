import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Couple, User } from '../../entities';
import { CreatePairDto, JoinPairDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PairService {
    constructor(
        @InjectRepository(Couple)
        private coupleRepository: Repository<Couple>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    private generatePairCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    async createPair(dto: CreatePairDto) {
        // Generate unique pair code
        let pairCode = '';
        let exists = true;

        while (exists) {
            pairCode = this.generatePairCode();
            const existing = await this.coupleRepository.findOne({ where: { pairCode } });
            exists = !!existing;
        }

        // Create couple
        const couple = this.coupleRepository.create({
            pairCode,
            isPaired: false,
        });
        await this.coupleRepository.save(couple);

        // Create user (creator)
        const user = this.userRepository.create({
            name: dto.name,
            coupleId: couple.id,
            isCreator: true,
        });
        await this.userRepository.save(user);

        // Generate JWT token
        const token = this.jwtService.sign({ userId: user.id, coupleId: couple.id });

        return {
            pairCode,
            userId: user.id,
            token,
        };
    }

    async joinPair(dto: JoinPairDto) {
        // Find couple by pair code
        const couple = await this.coupleRepository.findOne({
            where: { pairCode: dto.pairCode.toUpperCase() },
            relations: ['users'],
        });

        if (!couple) {
            throw new NotFoundException('Mã ghép cặp không tồn tại');
        }

        if (couple.isPaired) {
            throw new BadRequestException('Cặp đôi này đã được ghép');
        }

        // Create user (joiner)
        const user = this.userRepository.create({
            name: dto.name,
            coupleId: couple.id,
            isCreator: false,
        });
        await this.userRepository.save(user);

        // Mark couple as paired
        couple.isPaired = true;
        await this.coupleRepository.save(couple);

        // Get partner info
        const partner = couple.users.find((u) => u.isCreator);

        // Generate JWT token
        const token = this.jwtService.sign({ userId: user.id, coupleId: couple.id });

        return {
            userId: user.id,
            partnerId: partner?.id,
            partnerName: partner?.name,
            token,
        };
    }

    async getPartner(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['couple', 'couple.users'],
        });

        if (!user || !user.couple) {
            throw new NotFoundException('Không tìm thấy thông tin ghép cặp');
        }

        const partner = user.couple.users.find((u) => u.id !== userId);

        if (!partner) {
            return {
                partnerId: null,
                partnerName: null,
                isPaired: false,
                pairedAt: user.couple.createdAt,
            };
        }

        return {
            partnerId: partner.id,
            partnerName: partner.name,
            isPaired: true,
            pairedAt: user.couple.createdAt,
        };
    }

    async getUserById(userId: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id: userId } });
    }

    async getPartnerByUserId(userId: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['couple', 'couple.users'],
        });

        if (!user?.couple) return null;

        return user.couple.users.find((u) => u.id !== userId) || null;
    }
}
