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
import {
    ApiCookieAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
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
import { GenerateCreneauxDto } from '../dto/generate-creneaux.dto';
import { GenerateAllCreneauxDto } from '../dto/generate-all-creneaux.dto';
import { GenerateCreneauxUseCase } from '../use-cases/generate-creneaux.use-case';
import { GenerateAllCreneauxUseCase } from '../use-cases/generate-all-creneaux.use-case';
import { GetCreneauxUseCase } from '../use-cases/get-creneaux.use-case';
import { DeleteCreneauUseCase } from '../use-cases/delete-creneau.use-case';
import { DeleteCreneauxDisponiblesUseCase } from '../use-cases/delete-creneaux-disponibles.use-case';

@ApiTags('Administration — Planning')
@ApiCookieAuth('access_token')
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
        // Créneaux
        private readonly generateCreneauxUseCase: GenerateCreneauxUseCase,
        private readonly generateAllCreneauxUseCase: GenerateAllCreneauxUseCase,
        private readonly getCreneauxUseCase: GetCreneauxUseCase,
        private readonly deleteCreneauUseCase: DeleteCreneauUseCase,
        private readonly deleteCreneauxDisponiblesUseCase: DeleteCreneauxDisponiblesUseCase,
    ) {}

    // ── Modèles de planification ─────────────────────────────────────────────

    @ApiOkResponse({ description: 'Liste des modèles de planification' })
    @Get('modeles')
    getModeles(@Query('technicienId') technicienId: string) {
        return this.getModelesUseCase.execute(technicienId);
    }

    @ApiCreatedResponse({ description: 'Modèle de planification créé' })
    @Post('modeles')
    createModele(@Body() dto: CreateModelePlanificationDto) {
        return this.createModeleUseCase.execute(dto);
    }

    @ApiOkResponse({ description: 'Modèle de planification mis à jour' })
    @Patch('modeles/:id')
    updateModele(
        @Param('id') id: string,
        @Body() dto: UpdateModelePlanificationDto,
    ) {
        return this.updateModeleUseCase.execute(id, dto);
    }

    @ApiNoContentResponse({ description: 'Modèle de planification supprimé' })
    @Delete('modeles/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteModele(@Param('id') id: string) {
        return this.deleteModeleUseCase.execute(id);
    }

    // ── Pauses récurrentes ───────────────────────────────────────────────────

    @ApiOkResponse({ description: 'Liste des pauses récurrentes' })
    @Get('pauses')
    getPauses(@Query('technicienId') technicienId: string) {
        return this.getPausesUseCase.execute(technicienId);
    }

    @ApiCreatedResponse({ description: 'Pause récurrente créée' })
    @Post('pauses')
    createPause(@Body() dto: CreatePauseRecurrenteDto) {
        return this.createPauseUseCase.execute(dto);
    }

    @ApiNoContentResponse({ description: 'Pause récurrente supprimée' })
    @Delete('pauses/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deletePause(@Param('id') id: string) {
        return this.deletePauseUseCase.execute(id);
    }

    // ── Indisponibilités ─────────────────────────────────────────────────────

    @ApiOkResponse({ description: 'Liste des indisponibilités' })
    @Get('indisponibilites')
    getIndisponibilites(@Query('technicienId') technicienId: string) {
        return this.getIndisponibilitesUseCase.execute(technicienId);
    }

    @ApiCreatedResponse({ description: 'Indisponibilité créée' })
    @Post('indisponibilites')
    createIndisponibilite(@Body() dto: CreateIndisponibiliteDto) {
        return this.createIndisponibiliteUseCase.execute(dto);
    }

    @ApiNoContentResponse({ description: 'Indisponibilité supprimée' })
    @Delete('indisponibilites/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteIndisponibilite(@Param('id') id: string) {
        return this.deleteIndisponibiliteUseCase.execute(id);
    }

    // ── Créneaux ─────────────────────────────────────────────────────────────

    // Routes statiques déclarées avant les routes paramétrées (:id)
    // pour éviter que NestJS les interprète comme des identifiants.
    @ApiOperation({
        summary:
            "Génère les créneaux d'un technicien (algorithme 3 couches : modèle → pauses → indisponibilités)",
    })
    @ApiCreatedResponse({ description: 'Créneaux générés' })
    @Post('creneaux/generate')
    generateCreneaux(@Body() dto: GenerateCreneauxDto) {
        return this.generateCreneauxUseCase.execute(dto);
    }

    @ApiCreatedResponse({
        description: 'Créneaux générés pour tous les techniciens',
    })
    @Post('creneaux/generate-all')
    generateAllCreneaux(@Body() dto: GenerateAllCreneauxDto) {
        return this.generateAllCreneauxUseCase.execute({
            technicienId: dto.technicienId,
            dateFinGeneration: dto.dateFinGeneration,
        });
    }

    @ApiOkResponse({ description: 'Liste des créneaux' })
    @Get('creneaux')
    getCreneaux(
        @Query('technicienId') technicienId: string,
        @Query('dateDebut') dateDebut: string,
        @Query('dateFin') dateFin: string,
    ) {
        return this.getCreneauxUseCase.execute({
            technicienId,
            dateDebut,
            dateFin,
        });
    }

    @ApiOkResponse({ description: 'Nombre de créneaux disponibles supprimés' })
    @Delete('creneaux/disponibles')
    @HttpCode(HttpStatus.OK)
    deleteCreneauxDisponibles(
        @Query('technicienId') technicienId: string,
        @Query('dateDebut') dateDebut: string,
        @Query('dateFin') dateFin: string,
    ) {
        return this.deleteCreneauxDisponiblesUseCase.execute({
            technicienId,
            dateDebut,
            dateFin,
        });
    }

    @ApiNoContentResponse({ description: 'Créneau supprimé' })
    @Delete('creneaux/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteCreneau(@Param('id') id: string) {
        return this.deleteCreneauUseCase.execute(id);
    }
}
