import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import {
    ApiCookieAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '../../../config/cookie.config';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ConfirmEmailUseCase } from '../use-cases/confirm-email.use-case';
import { LoginUseCase } from '../use-cases/login.use-case';
import { LogoutUseCase } from '../use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case';
import { RegisterUseCase } from '../use-cases/register.use-case';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly registerUseCase: RegisterUseCase,
        private readonly confirmEmailUseCase: ConfirmEmailUseCase,
        private readonly loginUseCase: LoginUseCase,
        private readonly logoutUseCase: LogoutUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
    ) {}

    @ApiCreatedResponse({
        description: 'Compte créé — email de confirmation envoyé',
    })
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.registerUseCase.execute(dto);
    }

    @ApiOkResponse({ description: 'Email confirmé' })
    @Get('confirm-email')
    confirmEmail(@Query('token') token: string) {
        return this.confirmEmailUseCase.execute(token);
    }

    @ApiOperation({
        summary:
            "Authentification — pose access_token et refresh_token en cookies HttpOnly (le token n'est jamais retourné dans le body)",
    })
    @ApiOkResponse({ description: 'Connexion réussie — cookies posés' })
    @HttpCode(HttpStatus.OK)
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

    @ApiOkResponse({ description: 'Token renouvelé' })
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.refresh_token as string | undefined;
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token manquant.');
        }

        const result = await this.refreshTokenUseCase.execute(refreshToken);
        res.cookie('access_token', result.accessToken, ACCESS_COOKIE);

        return { message: 'Token renouvelé.' };
    }

    @ApiCookieAuth('access_token')
    @ApiOkResponse({ description: 'Déconnecté — cookies effacés' })
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { userId } = req.user as { userId: string };
        await this.logoutUseCase.execute(userId);

        res.clearCookie('access_token');
        res.clearCookie('refresh_token', { path: REFRESH_COOKIE.path });

        return { message: 'Déconnecté.' };
    }
}
