import { Module } from '@nestjs/common';
import { AdminPlanningController } from './controllers/admin-planning.controller';
import { PlanningPrismaRepository } from './repositories/planning.prisma.repository';
import { PLANNING_REPO } from './repositories/planning.repository.interface';
import { CreateModelePlanificationUseCase } from './use-cases/create-modele-planification.use-case';
import { GetModelesUseCase } from './use-cases/get-modeles.use-case';
import { GetZonesProposeesUseCase } from './use-cases/get-zones-proposees.use-case';

@Module({
    controllers: [AdminPlanningController],
    providers: [
        { provide: PLANNING_REPO, useClass: PlanningPrismaRepository },
        GetZonesProposeesUseCase,
        CreateModelePlanificationUseCase,
        GetModelesUseCase,
    ],
})
export class PlanningModule {}
