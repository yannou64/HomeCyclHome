import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import {
    ApiCookieAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { CreateModelePlanificationDto } from '../dto/input/create-modele-planification.dto';
import { UpdateModelePlanificationDto } from '../dto/input/update-modele-planification.dto';
import { ModeleDetailResponseDto } from '../dto/output/modele-detail-response.dto';
import { ModelePlanificationResponseDto } from '../dto/output/modele-planification-response.dto';
import { ModeleResumeResponseDto } from '../dto/output/modele-resume-response.dto';
import { ZoneProposeeResponseDto } from '../dto/output/zone-proposee-response.dto';
import { CreateModelePlanificationUseCase } from '../use-cases/create-modele-planification.use-case';
import { GetModeleUseCase } from '../use-cases/get-modele.use-case';
import { GetModelesUseCase } from '../use-cases/get-modeles.use-case';
import { GetZonesProposeesUseCase } from '../use-cases/get-zones-proposees.use-case';
import { UpdateModelePlanificationUseCase } from '../use-cases/update-modele-planification.use-case';

// Toutes les routes du planning sont réservées aux admins (RG1)
@ApiTags('Administration — Planning')
@ApiCookieAuth('access_token')
@Controller('admin/planning')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminPlanningController {
    constructor(
        private readonly getZonesProposeesUseCase: GetZonesProposeesUseCase,
        private readonly createModeleUseCase: CreateModelePlanificationUseCase,
        private readonly getModelesUseCase: GetModelesUseCase,
        private readonly getModeleUseCase: GetModeleUseCase,
        private readonly updateModeleUseCase: UpdateModelePlanificationUseCase,
    ) {}

    @ApiOkResponse({
        description: 'Modèles du technicien, avec leur zone et leur validité',
        type: [ModeleResumeResponseDto],
    })
    @Get('techniciens/:technicienId/modeles')
    getModeles(@Param('technicienId') technicienId: string) {
        return this.getModelesUseCase.execute(technicienId);
    }

    @ApiOkResponse({
        description: 'Zones affectées au technicien et actives',
        type: [ZoneProposeeResponseDto],
    })
    @Get('techniciens/:technicienId/zones')
    getZonesProposees(@Param('technicienId') technicienId: string) {
        return this.getZonesProposeesUseCase.execute(technicienId);
    }

    @ApiCreatedResponse({
        description: 'Modèle créé',
        type: ModelePlanificationResponseDto,
    })
    @Post('techniciens/:technicienId/modeles')
    createModele(
        @Param('technicienId') technicienId: string,
        @Body() dto: CreateModelePlanificationDto,
    ) {
        return this.createModeleUseCase.execute(technicienId, dto);
    }

    @ApiOkResponse({
        description: 'Le modèle, ses blocs, et s’il est encore valide',
        type: ModeleDetailResponseDto,
    })
    @Get('techniciens/:technicienId/modeles/:modeleId')
    getModele(
        @Param('technicienId') technicienId: string,
        @Param('modeleId') modeleId: string,
    ) {
        return this.getModeleUseCase.execute(technicienId, modeleId);
    }

    // PUT : la modification remplace tout le modèle (séquence de l'US-02)
    @ApiOkResponse({
        description: 'Modèle modifié',
        type: ModelePlanificationResponseDto,
    })
    @Put('techniciens/:technicienId/modeles/:modeleId')
    updateModele(
        @Param('technicienId') technicienId: string,
        @Param('modeleId') modeleId: string,
        @Body() dto: UpdateModelePlanificationDto,
    ) {
        return this.updateModeleUseCase.execute(technicienId, modeleId, dto);
    }
}
