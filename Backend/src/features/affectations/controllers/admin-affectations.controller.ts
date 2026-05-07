import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Put,
    UseGuards,
} from '@nestjs/common';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SetTechnicienZonesDto } from '../dto/set-technicien-zones.dto';
import { DeleteTechnicienAffectationsUseCase } from '../use-cases/delete-technicien-affectations.use-case';
import { GetAffectationsUseCase } from '../use-cases/get-affectations.use-case';
import { SetTechnicienZonesUseCase } from '../use-cases/set-technicien-zones.use-case';

@Controller('admin/affectations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminAffectationsController {
    constructor(
        private readonly getAffectationsUseCase: GetAffectationsUseCase,
        private readonly setTechnicienZonesUseCase: SetTechnicienZonesUseCase,
        private readonly deleteTechnicienAffectationsUseCase: DeleteTechnicienAffectationsUseCase,
    ) {}

    @Get()
    findAll() {
        return this.getAffectationsUseCase.execute();
    }

    @Put(':technicienId')
    setZones(
        @Param('technicienId') technicienId: string,
        @Body() dto: SetTechnicienZonesDto,
    ) {
        return this.setTechnicienZonesUseCase.execute(technicienId, dto.zone_ids);
    }

    @Delete(':technicienId')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('technicienId') technicienId: string) {
        return this.deleteTechnicienAffectationsUseCase.execute(technicienId);
    }
}