import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        // Check if username already exists
        const existingUser = await this.userRepository.findOne({
            where: { username: dto.username.toLowerCase() },
        });

        if (existingUser) {
            throw new ConflictException('Username đã tồn tại');
        }

        // Hash PIN
        const pinHash = await bcrypt.hash(dto.pin, 10);

        // Create user
        const user = this.userRepository.create({
            username: dto.username.toLowerCase(),
            name: dto.name,
            pinHash,
        });

        await this.userRepository.save(user);

        // Generate JWT token
        const token = this.jwtService.sign({ userId: user.id });

        return {
            userId: user.id,
            username: user.username,
            name: user.name,
            token,
        };
    }

    async login(dto: LoginDto) {
        // Find user by username
        const user = await this.userRepository.findOne({
            where: { username: dto.username.toLowerCase() },
            relations: ['partner'],
        });

        if (!user) {
            throw new UnauthorizedException('Username hoặc PIN không đúng');
        }

        // Verify PIN
        const isValidPin = await bcrypt.compare(dto.pin, user.pinHash);

        if (!isValidPin) {
            throw new UnauthorizedException('Username hoặc PIN không đúng');
        }

        // Generate JWT token
        const payload: any = { userId: user.id };
        // We don't really need coupleId in token anymore since we look up partner dynamically
        const token = this.jwtService.sign(payload);

        return {
            userId: user.id,
            username: user.username,
            name: user.name,
            isPaired: !!user.partner,
            pairCode: user.pairCode, // Return code so frontend can show it if waiting
            token,
        };
    }
}
