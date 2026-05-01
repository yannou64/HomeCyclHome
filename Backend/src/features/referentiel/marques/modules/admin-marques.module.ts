import { Module } from '@nestjs/common';
import { AdminMarquesController } from '../controllers/admin-marques.controller';
import { ReferentielMarquesController } from '../controllers/referentiel-marques.controller';
import { MarquesPrismaRepository } from '../repositories/marques.prisma.repository';
import { CreateMarqueUseCase } from '../use-cases/create-marque.use-case';
import { DeleteMarqueUseCase } from '../use-cases/delete-marque.use-case';
import { GetMarquesUseCase } from '../use-cases/get-marques.use-case';
import { UpdateMarqueUseCase } from '../use-cases/update-marque.use-case';

export const MARQUES_REPO = 'MARQUES_REPO';

@Module({
    controllers: [AdminMarquesController, ReferentielMarquesController],
    providers: [
        { provide: MARQUES_REPO, useClass: MarquesPrismaRepository },
        {
            provide: GetMarquesUseCase,
            useFactory: (repo: MarquesPrismaRepository) =>
                new GetMarquesUseCase(repo),
            inject: [MARQUES_REPO],
        },
        {
            provide: CreateMarqueUseCase,
            useFactory: (repo: MarquesPrismaRepository) =>
                new CreateMarqueUseCase(repo),
            inject: [MARQUES_REPO],
        },
        {
            provide: UpdateMarqueUseCase,
            useFactory: (repo: MarquesPrismaRepository) =>
                new UpdateMarqueUseCase(repo),
            inject: [MARQUES_REPO],
        },
        {
            provide: DeleteMarqueUseCase,
            useFactory: (repo: MarquesPrismaRepository) =>
                new DeleteMarqueUseCase(repo),
            inject: [MARQUES_REPO],
        },
    ],
})
export class MarquesModule {}
