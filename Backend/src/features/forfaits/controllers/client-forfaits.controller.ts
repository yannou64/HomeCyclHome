import { Controller, Get } from '@nestjs/common';
import { GetForfaitsActifsUseCase } from '../use-cases/get-forfaits-actifs.use-case';

@Controller('forfaits')
export class ClientForfaitsController {
    constructor(
        private readonly getForfaitsActifsUseCase: GetForfaitsActifsUseCase,
    ) {}

    @Get()
    findAll() {
        return this.getForfaitsActifsUseCase.execute();
    }
}
