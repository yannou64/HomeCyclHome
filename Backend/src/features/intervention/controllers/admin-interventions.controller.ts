import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
    ApiCookieAuth,
    ApiOkResponse,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { GetAdminInterventionsUseCase } from '../use-cases/get-admin-interventions.use-case';
import { GetAdminInterventionDetailUseCase } from '../use-cases/get-admin-intervention-detail.use-case';
import { GetAdminInterventionsQueryDto } from '../dto/input/get-admin-interventions-query.dto';

@ApiTags('Administration — Interventions')
@ApiCookieAuth('access_token')
@Controller('admin/interventions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminInterventionsController {
    constructor(
        private readonly getAllUseCase: GetAdminInterventionsUseCase,
        private readonly getDetailUseCase: GetAdminInterventionDetailUseCase,
    ) {}

    @ApiQuery({
        name: 'statut',
        required: false,
        enum: ['Planifiee', 'enRetard', 'archivees'],
    })
    @ApiQuery({ name: 'zoneId', required: false, type: String })
    @ApiQuery({ name: 'technicienId', required: false, type: String })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiOkResponse({
        description: 'Liste paginée des interventions (supervision admin)',
    })
    @Get()
    getAll(@Query() query: GetAdminInterventionsQueryDto) {
        return this.getAllUseCase.execute(query);
    }

    @ApiOkResponse({ description: "Détail d'une intervention" })
    @Get(':id')
    getDetail(@Param('id') id: string) {
        return this.getDetailUseCase.execute(id);
    }
}
