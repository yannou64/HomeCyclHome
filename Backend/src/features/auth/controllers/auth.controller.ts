import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Get('confirm-email')
    confirmEmail(@Query('token') token: string) {
        return this.authService.confirmEmail(token);
    }

    @Post('login')
    login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.login(dto, res);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const user = req.user as { userId: string };
        return this.authService.logout(user.userId, res);
    }
}
