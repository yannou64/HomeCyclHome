import { Module } from '@nestjs/common';
import { AdminPlanningController } from './controllers/admin-planning.controller';
import { PlanningPrismaRepository } from './repositories/planning.prisma.repository';
import { PLANNING_REPO } from './repositories/planning.repository.interface';
import { CreateModelePlanificationUseCase } from './use-cases/create-modele-planification.use-case';
import { GetModelesPlanificationUseCase } from './use-cases/get-modeles-planification.use-case';
import { UpdateModelePlanificationUseCase } from './use-cases/update-modele-planification.use-case';
import { DeleteModelePlanificationUseCase } from './use-cases/delete-modele-planification.use-case';
import { CreatePauseRecurrenteUseCase } from './use-cases/create-pause-recurrente.use-case';
import { GetPausesRecurrentesUseCase } from './use-cases/get-pauses-recurrentes.use-case';
import { DeletePauseRecurrenteUseCase } from './use-cases/delete-pause-recurrente.use-case';
import { CreateIndisponibiliteUseCase } from './use-cases/create-indisponibilite.use-case';
import { GetIndisponibilitesUseCase } from './use-cases/get-indisponibilites.use-case';
import { DeleteIndisponibiliteUseCase } from './use-cases/delete-indisponibilite.use-case';

@Module({
    controllers: [AdminPlanningController],
    providers: [
        // Le repository Prisma est enregistré derrière un token string.
        // Les use cases reçoivent l'interface IPlanningRepository, pas la classe Prisma.
        {
            provide: PLANNING_REPO,
            useClass: PlanningPrismaRepository,
        },
        // Modèles de planification
        {
            provide: GetModelesPlanificationUseCase,
            useFactory: (repo: PlanningPrismaRepository) =>
                new GetModelesPlanificationUseCase(repo),
            inject: [PLANNING_REPO],
        },
        {
            provide: CreateModelePlanificationUseCase,
            useFactory: (repo: PlanningPrismaRepository) =>
                new CreateModelePlanificationUseCase(repo),
            inject: [PLANNING_REPO],
        },
        {
            provide: UpdateModelePlanificationUseCase,
            useFactory: (repo: PlanningPrismaRepository) =>
                new UpdateModelePlanificationUseCase(repo),
            inject: [PLANNING_REPO],
        },
        {
            provide: DeleteModelePlanificationUseCase,
            useFactory: (repo: PlanningPrismaRepository) =>
                new DeleteModelePlanificationUseCase(repo),
            inject: [PLANNING_REPO],
        },
        // Pauses récurrentes
        {
            provide: GetPausesRecurrentesUseCase,
            useFactory: (repo: PlanningPrismaRepository) =>
                new GetPausesRecurrentesUseCase(repo),
            inject: [PLANNING_REPO],
        },
        {
            provide: CreatePauseRecurrenteUseCase,
            useFactory: (repo: PlanningPrismaRepository) =>
                new CreatePauseRecurrenteUseCase(repo),
            inject: [PLANNING_REPO],
        },
        {
            provide: DeletePauseRecurrenteUseCase,
            useFactory: (repo: PlanningPrismaRepository) =>
                new DeletePauseRecurrenteUseCase(repo),
            inject: [PLANNING_REPO],
        },
        // Indisponibilités
        {
            provide: GetIndisponibilitesUseCase,
            useFactory: (repo: PlanningPrismaRepository) =>
                new GetIndisponibilitesUseCase(repo),
            inject: [PLANNING_REPO],
        },
        {
            provide: CreateIndisponibiliteUseCase,
            useFactory: (repo: PlanningPrismaRepository) =>
                new CreateIndisponibiliteUseCase(repo),
            inject: [PLANNING_REPO],
        },
        {
            provide: DeleteIndisponibiliteUseCase,
            useFactory: (repo: PlanningPrismaRepository) =>
                new DeleteIndisponibiliteUseCase(repo),
            inject: [PLANNING_REPO],
        },
    ],
})
export class PlanningModule {}