import { Controller, Get } from '@nestjs/common';
import { GetMarquesUseCase } from '../use-cases/get-marques.use-case';

@Controller('referentiel/marques')
export class ReferentielMarquesController {
    constructor(private readonly getMarquesUseCase: GetMarquesUseCase) {}

    @Get()
    findAll() {
        return this.getMarquesUseCase.execute();
    }
}
