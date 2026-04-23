import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Req() req: Request) {
        const { userId } = req.user as { userId: string };
        return this.usersService.getProfile(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me')
    updateProfile(@Req() req: Request, @Body() dto: UpdateUserDto) {
        const { userId } = req.user as { userId: string };
        return this.usersService.updateProfile(userId, dto);
    }
}
