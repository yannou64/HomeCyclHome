import { Controller, Get, Query } from '@nestjs/common';
import { GetCreneauxDisponiblesQueryDto } from '../dto/get-creneaux-disponibles.dto';
import { GetCreneauxDisponiblesUseCase } from '../use-cases/get-creneaux-disponibles.use-case';

@Controller('creneaux')
export class ClientCreneauxController {
    constructor(
        private readonly getCreneauxDisponiblesUseCase: GetCreneauxDisponiblesUseCase,
    ) {}

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
