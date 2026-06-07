import { Module } from '@nestjs/common';
import { AdminForfaitsController } from '../controllers/admin-forfaits.controller';
import { ClientForfaitsController } from '../controllers/client-forfaits.controller';
import { ForfaitsPrismaRepository } from '../repositories/forfaits.prisma.repository';
import { CreateForfaitUseCase } from '../use-cases/create-forfait.use-case';
import { DeleteForfaitUseCase } from '../use-cases/delete-forfait.use-case';
import { GetForfaitsActifsUseCase } from '../use-cases/get-forfaits-actifs.use-case';
import { GetForfaitsUseCase } from '../use-cases/get-forfaits.use-case';
import { SetForfaitPrixUseCase } from '../use-cases/set-forfait-prix.use-case';
import { UpdateForfaitUseCase } from '../use-cases/update-forfait.use-case';

export const FORFAITS_REPO = 'FORFAITS_REPO';

@Module({
    controllers: [AdminForfaitsController, ClientForfaitsController],
    providers: [
        {
            provide: FORFAITS_REPO,
            useClass: ForfaitsPrismaRepository,
        },
        {
            provide: GetForfaitsUseCase,
            useFactory: (repo: ForfaitsPrismaRepository) =>
                new GetForfaitsUseCase(repo),
            inject: [FORFAITS_REPO],
        },
        {
            provide: CreateForfaitUseCase,
            useFactory: (repo: ForfaitsPrismaRepository) =>
                new CreateForfaitUseCase(repo),
            inject: [FORFAITS_REPO],
        },
        {
            provide: UpdateForfaitUseCase,
            useFactory: (repo: ForfaitsPrismaRepository) =>
                new UpdateForfaitUseCase(repo),
            inject: [FORFAITS_REPO],
        },
        {
            provide: DeleteForfaitUseCase,
            useFactory: (repo: ForfaitsPrismaRepository) =>
                new DeleteForfaitUseCase(repo),
            inject: [FORFAITS_REPO],
        },
        {
            provide: SetForfaitPrixUseCase,
            useFactory: (repo: ForfaitsPrismaRepository) =>
                new SetForfaitPrixUseCase(repo),
            inject: [FORFAITS_REPO],
        },
        {
            provide: GetForfaitsActifsUseCase,
            useFactory: (repo: ForfaitsPrismaRepository) =>
                new GetForfaitsActifsUseCase(repo),
            inject: [FORFAITS_REPO],
        },
    ],
})
export class ForfaitsModule {}
