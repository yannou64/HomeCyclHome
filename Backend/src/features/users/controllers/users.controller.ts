import { Body, Controller, Delete, Get, HttpCode, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from '../dto/update-user.dto';
import { DeleteAccountUseCase } from '../use-cases/delete-account.use-case';
import { GetProfileUseCase } from '../use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from '../use-cases/update-profile.use-case';

@Controller('users')
export class UsersController {
    constructor(
        private readonly getProfileUseCase: GetProfileUseCase,
        private readonly updateProfileUseCase: UpdateProfileUseCase,
        private readonly deleteAccountUseCase: DeleteAccountUseCase,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Req() req: Request) {
        const { userId } = req.user as { userId: string };
        return this.getProfileUseCase.execute(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me')
    updateProfile(@Req() req: Request, @Body() dto: UpdateUserDto) {
        const { userId } = req.user as { userId: string };
        return this.updateProfileUseCase.execute(userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('me')
    @HttpCode(204)
    deleteAccount(@Req() req: Request) {
        const { userId } = req.user as { userId: string };
        return this.deleteAccountUseCase.execute(userId);
    }
}
