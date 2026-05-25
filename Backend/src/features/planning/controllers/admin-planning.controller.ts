import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateModelePlanificationDto } from '../dto/create-modele-planification.dto';
import { UpdateModelePlanificationDto } from '../dto/update-modele-planification.dto';
import { CreatePauseRecurrenteDto } from '../dto/create-pause-recurrente.dto';
import { CreateIndisponibiliteDto } from '../dto/create-indisponibilite.dto';
import { CreateModelePlanificationUseCase } from '../use-cases/create-modele-planification.use-case';
import { GetModelesPlanificationUseCase } from '../use-cases/get-modeles-planification.use-case';
import { UpdateModelePlanificationUseCase } from '../use-cases/update-modele-planification.use-case';
import { DeleteModelePlanificationUseCase } from '../use-cases/delete-modele-planification.use-case';
import { CreatePauseRecurrenteUseCase } from '../use-cases/create-pause-recurrente.use-case';
import { GetPausesRecurrentesUseCase } from '../use-cases/get-pauses-recurrentes.use-case';
import { DeletePauseRecurrenteUseCase } from '../use-cases/delete-pause-recurrente.use-case';
import { CreateIndisponibiliteUseCase } from '../use-cases/create-indisponibilite.use-case';
import { GetIndisponibilitesUseCase } from '../use-cases/get-indisponibilites.use-case';
import { DeleteIndisponibiliteUseCase } from '../use-cases/delete-indisponibilite.use-case';

@Controller('admin/planning')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminPlanningController {
    constructor(
        // Modèles
        private readonly getModelesUseCase: GetModelesPlanificationUseCase,
        private readonly createModeleUseCase: CreateModelePlanificationUseCase,
        private readonly updateModeleUseCase: UpdateModelePlanificationUseCase,
        private readonly deleteModeleUseCase: DeleteModelePlanificationUseCase,
        // Pauses
        private readonly getPausesUseCase: GetPausesRecurrentesUseCase,
        private readonly createPauseUseCase: CreatePauseRecurrenteUseCase,
        private readonly deletePauseUseCase: DeletePauseRecurrenteUseCase,
        // Indisponibilités
        private readonly getIndisponibilitesUseCase: GetIndisponibilitesUseCase,
        private readonly createIndisponibiliteUseCase: CreateIndisponibiliteUseCase,
        private readonly deleteIndisponibiliteUseCase: DeleteIndisponibiliteUseCase,
    ) {}

    // ── Modèles de planification ─────────────────────────────────────────────

    @Get('modeles')
    getModeles(@Query('technicienId') technicienId: string) {
        return this.getModelesUseCase.execute(technicienId);
    }

    @Post('modeles')
    createModele(@Body() dto: CreateModelePlanificationDto) {
        return this.createModeleUseCase.execute(dto);
    }

    @Patch('modeles/:id')
    updateModele(
        @Param('id') id: string,
        @Body() dto: UpdateModelePlanificationDto,
    ) {
        return this.updateModeleUseCase.execute(id, dto);
    }

    @Delete('modeles/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteModele(@Param('id') id: string) {
        return this.deleteModeleUseCase.execute(id);
    }

    // ── Pauses récurrentes ───────────────────────────────────────────────────

    @Get('pauses')
    getPauses(@Query('technicienId') technicienId: string) {
        return this.getPausesUseCase.execute(technicienId);
    }

    @Post('pauses')
    createPause(@Body() dto: CreatePauseRecurrenteDto) {
        return this.createPauseUseCase.execute(dto);
    }

    @Delete('pauses/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deletePause(@Param('id') id: string) {
        return this.deletePauseUseCase.execute(id);
    }

    // ── Indisponibilités ─────────────────────────────────────────────────────

    @Get('indisponibilites')
    getIndisponibilites(@Query('technicienId') technicienId: string) {
        return this.getIndisponibilitesUseCase.execute(technicienId);
    }

    @Post('indisponibilites')
    createIndisponibilite(@Body() dto: CreateIndisponibiliteDto) {
        return this.createIndisponibiliteUseCase.execute(dto);
    }

    @Delete('indisponibilites/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteIndisponibilite(@Param('id') id: string) {
        return this.deleteIndisponibiliteUseCase.execute(id);
    }
}