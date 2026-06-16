import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { GetAdminStatsUseCase } from '../use-cases/get-admin-stats.use-case';
import { AdminStatsDto } from '../dto/admin-stats.dto';

@Controller('admin/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminStatsController {
    constructor(private readonly getStatsUseCase: GetAdminStatsUseCase) {}

    @Get()
    get(): Promise<AdminStatsDto> {
        return this.getStatsUseCase.execute();
    }
}
