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
import { ACCESS_COOKIE, REFRESH_COOKIE } from '../../../config/cookie.config';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ConfirmEmailUseCase } from '../use-cases/confirm-email.use-case';
import { LoginUseCase } from '../use-cases/login.use-case';
import { LogoutUseCase } from '../use-cases/logout.use-case';
import { RegisterUseCase } from '../use-cases/register.use-case';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly registerUseCase: RegisterUseCase,
        private readonly confirmEmailUseCase: ConfirmEmailUseCase,
        private readonly loginUseCase: LoginUseCase,
        private readonly logoutUseCase: LogoutUseCase,
    ) {}

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.registerUseCase.execute(dto);
    }

    @Get('confirm-email')
    confirmEmail(@Query('token') token: string) {
        return this.confirmEmailUseCase.execute(token);
    }

    @Post('login')
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.loginUseCase.execute(dto);

        // Les cookies sont une responsabilité HTTP — ils restent dans le controller
        res.cookie('access_token', result.accessToken, ACCESS_COOKIE);
        res.cookie('refresh_token', result.refreshToken, REFRESH_COOKIE);

        return {
            userId: result.userId,
            role: result.role,
            prenom: result.prenom,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { userId } = req.user as { userId: string };
        await this.logoutUseCase.execute(userId);

        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        return { message: 'Déconnecté.' };
    }
}
