import { Module } from '@nestjs/common';
import { CyclesController } from '../controllers/cycles.controller';
import { CyclesPrismaRepository } from '../repositories/cycles.prisma.repository';
import { CreateCycleUseCase } from '../use-cases/create-cycle.use-case';
import { DeleteCycleUseCase } from '../use-cases/delete-cycle.use-case';
import { GetCyclesUseCase } from '../use-cases/get-cycles.use-case';
import { UpdateCycleUseCase } from '../use-cases/update-cycle.use-case';

export const CYCLES_REPO = 'CYCLES_REPO';

@Module({
    controllers: [CyclesController],
    providers: [
        { provide: CYCLES_REPO, useClass: CyclesPrismaRepository },
        {
            provide: GetCyclesUseCase,
            useFactory: (repo: CyclesPrismaRepository) =>
                new GetCyclesUseCase(repo),
            inject: [CYCLES_REPO],
        },
        {
            provide: CreateCycleUseCase,
            useFactory: (repo: CyclesPrismaRepository) =>
                new CreateCycleUseCase(repo),
            inject: [CYCLES_REPO],
        },
        {
            provide: UpdateCycleUseCase,
            useFactory: (repo: CyclesPrismaRepository) =>
                new UpdateCycleUseCase(repo),
            inject: [CYCLES_REPO],
        },
        {
            provide: DeleteCycleUseCase,
            useFactory: (repo: CyclesPrismaRepository) =>
                new DeleteCycleUseCase(repo),
            inject: [CYCLES_REPO],
        },
    ],
})
export class CycleModule {}
