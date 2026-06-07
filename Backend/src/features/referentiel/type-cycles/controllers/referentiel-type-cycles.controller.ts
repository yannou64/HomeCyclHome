import { Controller, Get } from '@nestjs/common';
import { GetTypeCyclesUseCase } from '../use-cases/get-type-cycles.use-case';

@Controller('referentiel/type-cycles')
export class ReferentielTypeCyclesController {
    constructor(private readonly getTypeCyclesUseCase: GetTypeCyclesUseCase) {}

    @Get()
    findAll() {
        return this.getTypeCyclesUseCase.execute();
    }
}
