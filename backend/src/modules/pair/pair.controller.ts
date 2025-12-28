import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { PairService } from './pair.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Pair')
@Controller('pair')
export class PairController {
    constructor(private readonly pairService: PairService) { }

    @Post('create')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Tạo mã ghép cặp', description: 'Tạo mã 6 ký tự để partner nhập vào để ghép cặp' })
    @ApiResponse({ status: 201, description: 'Trả về mã ghép cặp' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực' })
    @ApiResponse({ status: 400, description: 'Người dùng đã có partner' })
    async createPair(@CurrentUser('userId') userId: string) {
        return this.pairService.createPair(userId);
    }

    @Post('join')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Nhập mã ghép cặp', description: 'Nhập mã ghép cặp để kết nối với partner' })
    @ApiBody({ schema: { type: 'object', properties: { pairCode: { type: 'string', example: 'ABC123' } } } })
    @ApiResponse({ status: 200, description: 'Ghép cặp thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực' })
    @ApiResponse({ status: 400, description: 'Mã không hợp lệ hoặc người dùng đã có partner' })
    async joinPair(
        @CurrentUser('userId') userId: string,
        @Body('pairCode') pairCode: string,
    ) {
        return this.pairService.joinPair(userId, pairCode);
    }

    @Get('partner')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Lấy thông tin partner', description: 'Lấy thông tin của partner đã ghép cặp' })
    @ApiResponse({ status: 200, description: 'Trả về thông tin partner' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực' })
    @ApiResponse({ status: 404, description: 'Chưa có partner' })
    async getPartner(@CurrentUser('userId') userId: string) {
        return this.pairService.getPartner(userId);
    }
}
