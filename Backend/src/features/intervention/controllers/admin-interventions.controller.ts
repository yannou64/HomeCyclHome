import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { GetAdminInterventionsUseCase } from '../use-cases/get-admin-interventions.use-case';
import { GetAdminInterventionDetailUseCase } from '../use-cases/get-admin-intervention-detail.use-case';
import { GetAdminInterventionsQueryDto } from '../dto/input/get-admin-interventions-query.dto';

@Controller('admin/interventions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminInterventionsController {
    constructor(
        private readonly getAllUseCase: GetAdminInterventionsUseCase,
        private readonly getDetailUseCase: GetAdminInterventionDetailUseCase,
    ) {}

    @Get()
    getAll(@Query() query: GetAdminInterventionsQueryDto) {
        return this.getAllUseCase.execute(query);
    }

    @Get(':id')
    getDetail(@Param('id') id: string) {
        return this.getDetailUseCase.execute(id);
    }
}
