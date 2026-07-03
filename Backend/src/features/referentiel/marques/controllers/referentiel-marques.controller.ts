import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetMarquesUseCase } from '../use-cases/get-marques.use-case';

@ApiTags('Référentiel — Marques')
@Controller('referentiel/marques')
export class ReferentielMarquesController {
    constructor(private readonly getMarquesUseCase: GetMarquesUseCase) {}

    @ApiOkResponse({ description: 'Liste des marques' })
    @Get()
    findAll() {
        return this.getMarquesUseCase.execute();
    }
}
