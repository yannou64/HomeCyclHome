import { Controller, Get, UseGuards } from '@nestjs/common';
import {
    ApiCookieAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { GetAdminStatsUseCase } from '../use-cases/get-admin-stats.use-case';
import { AdminStatsDto } from '../dto/admin-stats.dto';

@ApiTags('Administration — Utilisateurs')
@ApiCookieAuth('access_token')
@Controller('admin/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminStatsController {
    constructor(private readonly getStatsUseCase: GetAdminStatsUseCase) {}

    @ApiOperation({
        summary:
            'Tableau de bord administrateur — KPIs globaux (interventions, zones actives, techniciens affectés)',
    })
    @ApiOkResponse({
        description: 'KPIs du tableau de bord',
        type: AdminStatsDto,
    })
    @Get()
    get(): Promise<AdminStatsDto> {
        return this.getStatsUseCase.execute();
    }
}
