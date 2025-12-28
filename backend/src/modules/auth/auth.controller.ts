import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Đăng ký tài khoản', description: 'Tạo tài khoản mới với username, name và PIN' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: 201, description: 'Đăng ký thành công, trả về access token và thông tin user' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: 409, description: 'Username đã tồn tại' })
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Đăng nhập', description: 'Đăng nhập với username và PIN' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Đăng nhập thành công, trả về access token và thông tin user' })
    @ApiResponse({ status: 401, description: 'Username hoặc PIN không đúng' })
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('adminDebugAccount')
    @ApiOperation({ summary: 'Debug Account', description: 'Get all accounts' })
    async adminDebugAccount() {
        return this.authService.adminDebugAccount();
    }
}
