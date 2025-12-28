import { Controller, Put, Get, Post, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { UpdateFcmTokenDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('User')
@ApiBearerAuth('JWT-auth')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @Put('fcm-token')
    @ApiOperation({ summary: 'Cập nhật FCM token', description: 'Cập nhật token Firebase Cloud Messaging để nhận thông báo' })
    @ApiBody({ type: UpdateFcmTokenDto })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực' })
    async updateFcmToken(
        @CurrentUser('userId') userId: string,
        @Body() dto: UpdateFcmTokenDto,
    ) {
        return this.userService.updateFcmToken(userId, dto);
    }

    @Post('avatar')
    @ApiOperation({ summary: 'Upload avatar', description: 'Upload ảnh đại diện mới cho người dùng' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Ảnh đại diện (JPEG, PNG, WebP)',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Upload thành công, trả về URL ảnh' })
    @ApiResponse({ status: 400, description: 'File không hợp lệ' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực' })
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(
        @CurrentUser('userId') userId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('Vui lòng chọn file ảnh');
        }

        // Validate file type
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Chỉ chấp nhận file JPEG, PNG hoặc WebP');
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException('File quá lớn, tối đa 5MB');
        }

        const avatarUrl = await this.cloudinaryService.uploadImage(file);
        if (!avatarUrl) {
            throw new BadRequestException('Không thể upload ảnh. Vui lòng thử lại sau.');
        }

        return this.userService.updateAvatar(userId, avatarUrl);
    }

    @Get('profile')
    @ApiOperation({ summary: 'Lấy thông tin profile', description: 'Lấy thông tin cá nhân của người dùng hiện tại' })
    @ApiResponse({ status: 200, description: 'Trả về thông tin profile' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực' })
    async getProfile(@CurrentUser('userId') userId: string) {
        return this.userService.getProfile(userId);
    }
}
