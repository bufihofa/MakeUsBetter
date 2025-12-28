import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { PairService } from './pair.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('pair')
export class PairController {
    constructor(private readonly pairService: PairService) { }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    async createPair(@CurrentUser('userId') userId: string) {
        return this.pairService.createPair(userId);
    }

    @Post('join')
    @UseGuards(JwtAuthGuard)
    async joinPair(
        @CurrentUser('userId') userId: string,
        @Body('pairCode') pairCode: string,
    ) {
        return this.pairService.joinPair(userId, pairCode);
    }

    @Get('partner')
    @UseGuards(JwtAuthGuard)
    async getPartner(@CurrentUser('userId') userId: string) {
        return this.pairService.getPartner(userId);
    }
}
