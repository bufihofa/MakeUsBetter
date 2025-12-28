import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { PairService } from './pair.service';
import { CreatePairDto, JoinPairDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('pair')
export class PairController {
    constructor(private readonly pairService: PairService) { }

    @Post('create')
    async createPair(@Body() dto: CreatePairDto) {
        return this.pairService.createPair(dto);
    }

    @Post('join')
    async joinPair(@Body() dto: JoinPairDto) {
        return this.pairService.joinPair(dto);
    }

    @Get('partner')
    @UseGuards(JwtAuthGuard)
    async getPartner(@CurrentUser('userId') userId: string) {
        return this.pairService.getPartner(userId);
    }
}
