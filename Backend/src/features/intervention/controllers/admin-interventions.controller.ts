import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
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

    @ApiOkResponse({
        description: 'Liste des interventions (supervision admin)',
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
