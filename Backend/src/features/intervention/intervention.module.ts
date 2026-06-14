import { Module } from '@nestjs/common';
import { InterventionsController } from './controllers/interventions.controller';
import { InterventionsPrismaRepository } from './repositories/interventions.prisma.repository';
import { CreateInterventionUseCase } from './use-cases/create-intervention.use-case';
import { GetClientInterventionsUseCase } from './use-cases/get-client-interventions.use-case';
import { CancelInterventionUseCase } from './use-cases/cancel-intervention.use-case';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';

export const INTERVENTIONS_REPO = 'INTERVENTIONS_REPO';

@Module({
    imports: [EmailModule],
    controllers: [InterventionsController],
    providers: [
        {
            provide: INTERVENTIONS_REPO,
            useClass: InterventionsPrismaRepository,
        },
        {
            provide: CreateInterventionUseCase,
            useFactory: (
                repo: InterventionsPrismaRepository,
                emailService: EmailService,
            ) => new CreateInterventionUseCase(repo, emailService),
            inject: [INTERVENTIONS_REPO, EmailService],
        },
        {
            provide: GetClientInterventionsUseCase,
            useFactory: (repo: InterventionsPrismaRepository) =>
                new GetClientInterventionsUseCase(repo),
            inject: [INTERVENTIONS_REPO],
        },
        {
            provide: CancelInterventionUseCase,
            useFactory: (repo: InterventionsPrismaRepository) =>
                new CancelInterventionUseCase(repo),
            inject: [INTERVENTIONS_REPO],
        },
    ],
})
export class InterventionModule {}
