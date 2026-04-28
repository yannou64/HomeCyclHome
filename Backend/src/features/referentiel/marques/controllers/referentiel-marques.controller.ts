import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { GetMarquesUseCase } from '../use-cases/get-marques.use-case';

@Controller('referentiel/marques')
@UseGuards(JwtAuthGuard)
export class ReferentielMarquesController {
    constructor(private readonly getMarquesUseCase: GetMarquesUseCase) {}

    @Get()
    findAll() {
        return this.getMarquesUseCase.execute();
    }
}
