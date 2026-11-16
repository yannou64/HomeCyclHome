import { Module } from '@nestjs/common';
import { AdminMarquesController } from './controllers/admin-marques.controller';
import { ReferentielMarquesController } from './controllers/referentiel-marques.controller';
import { MarquesPrismaRepository } from './repositories/marques.prisma.repository';
import { CreateMarqueUseCase } from './use-cases/create-marque.use-case';
import { DeleteMarqueUseCase } from './use-cases/delete-marque.use-case';
import { GetMarquesUseCase } from './use-cases/get-marques.use-case';
import { MARQUES_REPO } from './repositories/marques.repository.interface';
import { UpdateMarqueUseCase } from './use-cases/update-marque.use-case';

@Module({
    controllers: [AdminMarquesController, ReferentielMarquesController],
    providers: [
        { provide: MARQUES_REPO, useClass: MarquesPrismaRepository },
        GetMarquesUseCase,
        CreateMarqueUseCase,
        UpdateMarqueUseCase,
        DeleteMarqueUseCase,
    ],
})
export class MarquesModule {}
