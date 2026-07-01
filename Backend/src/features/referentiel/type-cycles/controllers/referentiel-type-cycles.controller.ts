import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetTypeCyclesUseCase } from '../use-cases/get-type-cycles.use-case';

@ApiTags('Référentiel — Types')
@Controller('referentiel/type-cycles')
export class ReferentielTypeCyclesController {
    constructor(private readonly getTypeCyclesUseCase: GetTypeCyclesUseCase) {}

    @ApiOkResponse({ description: 'Liste des types de cycles' })
    @Get()
    findAll() {
        return this.getTypeCyclesUseCase.execute();
    }
}
