import { Module } from '@nestjs/common';
import { AdminForfaitsController } from './controllers/admin-forfaits.controller';
import { ClientForfaitsController } from './controllers/client-forfaits.controller';
import { ForfaitsPrismaRepository } from './repositories/forfaits.prisma.repository';
import { CreateForfaitUseCase } from './use-cases/create-forfait.use-case';
import { DeleteForfaitUseCase } from './use-cases/delete-forfait.use-case';
import { GetForfaitsActifsUseCase } from './use-cases/get-forfaits-actifs.use-case';
import { GetForfaitsUseCase } from './use-cases/get-forfaits.use-case';
import { SetForfaitPrixUseCase } from './use-cases/set-forfait-prix.use-case';
import { FORFAITS_REPO } from './repositories/forfaits.repository.interface';
import { UpdateForfaitUseCase } from './use-cases/update-forfait.use-case';

@Module({
    controllers: [AdminForfaitsController, ClientForfaitsController],
    providers: [
        {
            provide: FORFAITS_REPO,
            useClass: ForfaitsPrismaRepository,
        },
        GetForfaitsUseCase,
        CreateForfaitUseCase,
        UpdateForfaitUseCase,
        DeleteForfaitUseCase,
        SetForfaitPrixUseCase,
        GetForfaitsActifsUseCase,
    ],
})
export class ForfaitsModule {}
