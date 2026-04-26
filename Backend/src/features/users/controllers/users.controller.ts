import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from '../dto/update-user.dto';
import { GetProfileUseCase } from '../use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from '../use-cases/update-profile.use-case';

@Controller('users')
export class UsersController {
    constructor(
        private readonly getProfileUseCase: GetProfileUseCase,
        private readonly updateProfileUseCase: UpdateProfileUseCase,
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
}
