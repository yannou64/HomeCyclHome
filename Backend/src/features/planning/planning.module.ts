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
import { GenerateCreneauxUseCase } from './use-cases/generate-creneaux.use-case';
import { GenerateAllCreneauxUseCase } from './use-cases/generate-all-creneaux.use-case';
import { GetCreneauxUseCase } from './use-cases/get-creneaux.use-case';
import { DeleteCreneauUseCase } from './use-cases/delete-creneau.use-case';
import { DeleteCreneauxDisponiblesUseCase } from './use-cases/delete-creneaux-disponibles.use-case';
import { GetCreneauxDisponiblesUseCase } from './use-cases/get-creneaux-disponibles.use-case';
import { ClientCreneauxController } from './controllers/client-creneaux.controller';

@Module({
    controllers: [AdminPlanningController, ClientCreneauxController],
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
        // Créneaux
        {
            provide: GenerateCreneauxUseCase,
            useFactory: (repo: PlanningPrismaRepository) =>
                new GenerateCreneauxUseCase(repo),
            inject: [PLANNING_REPO],
        },
        {
            provide: GenerateAllCreneauxUseCase,
            useFactory: (
                repo: PlanningPrismaRepository,
                generate: GenerateCreneauxUseCase,
            ) => new GenerateAllCreneauxUseCase(repo, generate),
            inject: [PLANNING_REPO, GenerateCreneauxUseCase],
        },
        {
            provide: GetCreneauxUseCase,
            useFactory: (repo: PlanningPrismaRepository) =>
                new GetCreneauxUseCase(repo),
            inject: [PLANNING_REPO],
        },
        {
            provide: DeleteCreneauUseCase,
            useFactory: (repo: PlanningPrismaRepository) =>
                new DeleteCreneauUseCase(repo),
            inject: [PLANNING_REPO],
        },
        {
            provide: DeleteCreneauxDisponiblesUseCase,
            useFactory: (repo: PlanningPrismaRepository) =>
                new DeleteCreneauxDisponiblesUseCase(repo),
            inject: [PLANNING_REPO],
        },
        {
            provide: GetCreneauxDisponiblesUseCase,
            useFactory: (repo: PlanningPrismaRepository) =>
                new GetCreneauxDisponiblesUseCase(repo),
            inject: [PLANNING_REPO],
        },
    ],
})
export class PlanningModule {}
