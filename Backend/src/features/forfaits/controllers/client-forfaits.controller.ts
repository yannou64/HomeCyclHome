import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetForfaitsActifsUseCase } from '../use-cases/get-forfaits-actifs.use-case';

@ApiTags('Forfaits')
@Controller('forfaits')
export class ClientForfaitsController {
    constructor(
        private readonly getForfaitsActifsUseCase: GetForfaitsActifsUseCase,
    ) {}

    @ApiOkResponse({ description: 'Liste des forfaits actifs' })
    @Get()
    findAll() {
        return this.getForfaitsActifsUseCase.execute();
    }
}
