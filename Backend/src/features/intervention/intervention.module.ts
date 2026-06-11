import { Module } from '@nestjs/common';
import { InterventionsController } from './controllers/interventions.controller';
import { InterventionsPrismaRepository } from './repositories/interventions.prisma.repository';
import { CreateInterventionUseCase } from './use-cases/create-intervention.use-case';

export const INTERVENTIONS_REPO = 'INTERVENTIONS_REPO';

@Module({
    controllers: [InterventionsController],
    providers: [
        {
            provide: INTERVENTIONS_REPO,
            useClass: InterventionsPrismaRepository,
        },
        {
            provide: CreateInterventionUseCase,
            useFactory: (repo: InterventionsPrismaRepository) =>
                new CreateInterventionUseCase(repo),
            inject: [INTERVENTIONS_REPO],
        },
    ],
})
export class InterventionModule {}
