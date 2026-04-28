import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { GetTypeCyclesUseCase } from '../use-cases/get-type-cycles.use-case';

@Controller('referentiel/type-cycles')
@UseGuards(JwtAuthGuard)
export class ReferentielTypeCyclesController {
    constructor(private readonly getTypeCyclesUseCase: GetTypeCyclesUseCase) {}

    @Get()
    findAll() {
        return this.getTypeCyclesUseCase.execute();
    }
}
