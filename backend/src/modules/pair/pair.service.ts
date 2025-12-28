import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../entities';

@Injectable()
export class PairService {
    private readonly logger = new Logger(PairService.name);

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private dataSource: DataSource,
    ) { }

    private generatePairCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // Create pair - user must be authenticated
    async createPair(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['partner'],
        });

        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }

        // Check if user is already paired
        if (user.partner) {
            throw new ForbiddenException('Bạn đã ghép cặp rồi. Mỗi người chỉ được ghép cặp 1 lần duy nhất.');
        }

        // Generate unique pair code
        let pairCode = '';
        let exists = true;

        while (exists) {
            pairCode = this.generatePairCode();
            // Check if any user acts as creator with this code (waiting state)
            const existing = await this.userRepository.findOne({ where: { pairCode, isCreator: true } });
            exists = !!existing;
        }

        // Update user
        user.pairCode = pairCode;
        user.isCreator = true;
        await this.userRepository.save(user);

        // Generate new JWT token
        const token = this.jwtService.sign({ userId: user.id });

        this.logger.log(`User ${userId} created pair code ${pairCode}`);

        return {
            pairCode,
            userId: user.id,
            token,
        };
    }

    // Join pair - user must be authenticated and not already paired
    async joinPair(userId: string, pairCode: string) {
        this.logger.log(`User ${userId} attempting to join pair ${pairCode}`);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = await queryRunner.manager.findOne(User, {
                where: { id: userId },
                relations: ['partner'],
            });

            if (!user) {
                throw new NotFoundException('Không tìm thấy người dùng');
            }

            if (user.partner) {
                throw new ForbiddenException('Bạn đã ghép cặp rồi. Mỗi người chỉ được ghép cặp 1 lần duy nhất.');
            }

            // Find target user (the creator) by pairCode
            const partner = await queryRunner.manager.findOne(User, {
                where: { pairCode: pairCode.toUpperCase(), isCreator: true },
                relations: ['partner'],
            });

            if (!partner) {
                throw new NotFoundException('Mã ghép cặp không tồn tại hoặc không hợp lệ');
            }

            if (partner.partner) {
                throw new BadRequestException('Mã ghép cặp này đã được sử dụng (Người tạo đã ghép cặp)');
            }

            if (partner.id === user.id) {
                throw new BadRequestException('Không thể tự ghép cặp với chính mình');
            }

            // Link them together

            // Update joining user (User B)
            await queryRunner.manager.update(User, user.id, {
                partner: partner,
                isCreator: false,
                pairCode: pairCode.toUpperCase() // Keep code for reference
            });

            // Update creator user (User A)
            await queryRunner.manager.update(User, partner.id, {
                partner: user,
            });

            await queryRunner.commitTransaction();

            // Fetch fresh partner info to return
            const freshPartner = await this.userRepository.findOne({ where: { id: partner.id } });

            // Generate token
            const token = this.jwtService.sign({ userId: user.id });

            this.logger.log(`User ${userId} successfully joined with ${freshPartner?.id}`);

            return {
                userId: user.id,
                partnerId: freshPartner?.id,
                partnerName: freshPartner?.name,
                token,
                pairCode: pairCode.toUpperCase(),
            };

        } catch (err) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Join pair failed for user ${userId}: ${err.message}`);
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async getPartner(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['partner'],
        });

        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }

        this.logger.debug(`getPartner for user ${userId}. Partner: ${user.partner?.id}`);

        if (user.partner) {
            return {
                partnerId: user.partner.id,
                partnerName: user.partner.name,
                partnerAvatarUrl: user.partner.avatarUrl,
                isPaired: true,
                pairCode: user.pairCode,
                // Using createdAt as a proxy for pairedAt if needed, or null since we don't track exact pair time anymore
                pairedAt: user.createdAt,
            };
        }

        // Not paired, check if waiting (isCreator + has pairCode)
        if (user.isCreator && user.pairCode) {
            return {
                partnerId: null,
                partnerName: null,
                isPaired: false,
                pairCode: user.pairCode,
                pairedAt: null,
            };
        }

        // Just a single user
        return {
            partnerId: null,
            partnerName: null,
            isPaired: false,
            pairCode: null,
            pairedAt: null,
        };
    }

    async getUserById(userId: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id: userId } });
    }

    async getPartnerByUserId(userId: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['partner'],
        });

        return user?.partner || null;
    }
}
