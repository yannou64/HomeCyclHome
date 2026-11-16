import { Module } from '@nestjs/common';
import { CyclesController } from './controllers/cycles.controller';
import { CyclesPrismaRepository } from './repositories/cycles.prisma.repository';
import { CreateCycleUseCase } from './use-cases/create-cycle.use-case';
import { DeleteCycleUseCase } from './use-cases/delete-cycle.use-case';
import { GetCyclesUseCase } from './use-cases/get-cycles.use-case';
import { CYCLES_REPO } from './repositories/cycles.repository.interface';
import { UpdateCycleUseCase } from './use-cases/update-cycle.use-case';

@Module({
    controllers: [CyclesController],
    providers: [
        { provide: CYCLES_REPO, useClass: CyclesPrismaRepository },
        GetCyclesUseCase,
        CreateCycleUseCase,
        UpdateCycleUseCase,
        DeleteCycleUseCase,
    ],
})
export class CycleModule {}
