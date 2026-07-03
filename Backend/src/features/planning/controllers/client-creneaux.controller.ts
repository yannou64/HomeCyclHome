import { Controller, Get, Query } from '@nestjs/common';
import {
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { GetCreneauxDisponiblesQueryDto } from '../dto/get-creneaux-disponibles.dto';
import { GetCreneauxDisponiblesUseCase } from '../use-cases/get-creneaux-disponibles.use-case';

@ApiTags('Créneaux')
@Controller('creneaux')
export class ClientCreneauxController {
    constructor(
        private readonly getCreneauxDisponiblesUseCase: GetCreneauxDisponiblesUseCase,
    ) {}

    @ApiOperation({
        summary:
            'Retourne les créneaux disponibles filtrés par zone, durée forfait et plage de dates',
    })
    @ApiQuery({ name: 'zoneId', required: true, type: String })
    @ApiQuery({ name: 'dureeMinutes', required: true, type: Number })
    @ApiQuery({ name: 'dateDebut', required: true, type: String })
    @ApiQuery({ name: 'dateFin', required: true, type: String })
    @ApiOkResponse({ description: 'Liste des créneaux disponibles' })
    @Get()
    findDisponibles(@Query() query: GetCreneauxDisponiblesQueryDto) {
        return this.getCreneauxDisponiblesUseCase.execute({
            zoneId: query.zoneId,
            dureeMinutes: query.dureeMinutes,
            dateDebut: query.dateDebut,
            dateFin: query.dateFin,
        });
    }
}
