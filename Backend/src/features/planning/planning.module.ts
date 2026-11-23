import { Module } from '@nestjs/common';
import { AdminPlanningController } from './controllers/admin-planning.controller';
import { PlanningPrismaRepository } from './repositories/planning.prisma.repository';
import { PLANNING_REPO } from './repositories/planning.repository.interface';
import { ApercuPlanificationUseCase } from './use-cases/apercu-planification.use-case';
import { GetEcranPlanificationUseCase } from './use-cases/get-ecran-planification.use-case';
import { PlanifierTechnicienUseCase } from './use-cases/planifier-technicien.use-case';
import { CreateModelePlanificationUseCase } from './use-cases/create-modele-planification.use-case';
import { DeleteModelePlanificationUseCase } from './use-cases/delete-modele-planification.use-case';
import { GetCouvertureMoisUseCase } from './use-cases/get-couverture-mois.use-case';
import { GetJourneeUseCase } from './use-cases/get-journee.use-case';
import { GetModeleUseCase } from './use-cases/get-modele.use-case';
import { GetModelesUseCase } from './use-cases/get-modeles.use-case';
import { GetZonesProposeesUseCase } from './use-cases/get-zones-proposees.use-case';
import { UpdateModelePlanificationUseCase } from './use-cases/update-modele-planification.use-case';

@Module({
    controllers: [AdminPlanningController],
    providers: [
        { provide: PLANNING_REPO, useClass: PlanningPrismaRepository },
        GetZonesProposeesUseCase,
        CreateModelePlanificationUseCase,
        GetModelesUseCase,
        GetModeleUseCase,
        UpdateModelePlanificationUseCase,
        DeleteModelePlanificationUseCase,
        GetCouvertureMoisUseCase,
        GetJourneeUseCase,
        GetEcranPlanificationUseCase,
        ApercuPlanificationUseCase,
        PlanifierTechnicienUseCase,
    ],
})
export class PlanningModule {}
