import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiCookieAuth,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from '../dto/update-user.dto';
import { DeleteAccountUseCase } from '../use-cases/delete-account.use-case';
import { GetProfileUseCase } from '../use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from '../use-cases/update-profile.use-case';

@ApiTags('Profil')
@ApiCookieAuth('access_token')
@Controller('users')
export class UsersController {
    constructor(
        private readonly getProfileUseCase: GetProfileUseCase,
        private readonly updateProfileUseCase: UpdateProfileUseCase,
        private readonly deleteAccountUseCase: DeleteAccountUseCase,
    ) {}

    @ApiOkResponse({ description: 'Profil utilisateur connecté' })
    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Req() req: Request) {
        const { userId } = req.user as { userId: string };
        return this.getProfileUseCase.execute(userId);
    }

    @ApiOkResponse({ description: 'Profil mis à jour' })
    @UseGuards(JwtAuthGuard)
    @Patch('me')
    updateProfile(@Req() req: Request, @Body() dto: UpdateUserDto) {
        const { userId } = req.user as { userId: string };
        return this.updateProfileUseCase.execute(userId, dto);
    }

    @ApiNoContentResponse({ description: 'Compte supprimé' })
    @UseGuards(JwtAuthGuard)
    @Delete('me')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteAccount(@Req() req: Request) {
        const { userId } = req.user as { userId: string };
        return this.deleteAccountUseCase.execute(userId);
    }
}
