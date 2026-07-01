import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
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
