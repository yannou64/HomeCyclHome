import { Module } from '@nestjs/common';
import { AdminAffectationsController } from './controllers/admin-affectations.controller';
import { AffectationsPrismaRepository } from './repositories/affectations.prisma.repository';
import { AFFECTATIONS_REPO } from './repositories/affectations.repository.interface';
import { DeleteTechnicienAffectationsUseCase } from './use-cases/delete-technicien-affectations.use-case';
import { GetAffectationByTechnicienUseCase } from './use-cases/get-affectation-by-technicien.use-case';
import { GetAffectationsUseCase } from './use-cases/get-affectations.use-case';
import { SetTechnicienZonesUseCase } from './use-cases/set-technicien-zones.use-case';

@Module({
    controllers: [AdminAffectationsController],
    providers: [
        {
            provide: AFFECTATIONS_REPO,
            useClass: AffectationsPrismaRepository,
        },
        GetAffectationsUseCase,
        SetTechnicienZonesUseCase,
        DeleteTechnicienAffectationsUseCase,
        GetAffectationByTechnicienUseCase,
    ],
})
export class AffectationsModule {}
