import { Module } from '@nestjs/common';
import { AdminAffectationsController } from './controllers/admin-affectations.controller';
import { AffectationsPrismaRepository } from './repositories/affectations.prisma.repository';
import { AFFECTATIONS_REPO } from './repositories/affectations.repository.interface';
import { DeleteTechnicienAffectationsUseCase } from './use-cases/delete-technicien-affectations.use-case';
import { GetAffectationsUseCase } from './use-cases/get-affectations.use-case';
import { SetTechnicienZonesUseCase } from './use-cases/set-technicien-zones.use-case';

@Module({
    controllers: [AdminAffectationsController],
    providers: [
        {
            provide: AFFECTATIONS_REPO,
            useClass: AffectationsPrismaRepository,
        },
        {
            provide: GetAffectationsUseCase,
            useFactory: (repo: AffectationsPrismaRepository) =>
                new GetAffectationsUseCase(repo),
            inject: [AFFECTATIONS_REPO],
        },
        {
            provide: SetTechnicienZonesUseCase,
            useFactory: (repo: AffectationsPrismaRepository) =>
                new SetTechnicienZonesUseCase(repo),
            inject: [AFFECTATIONS_REPO],
        },
        {
            provide: DeleteTechnicienAffectationsUseCase,
            useFactory: (repo: AffectationsPrismaRepository) =>
                new DeleteTechnicienAffectationsUseCase(repo),
            inject: [AFFECTATIONS_REPO],
        },
    ],
})
export class AffectationsModule {}