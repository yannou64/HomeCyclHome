import { Module } from '@nestjs/common';
import { InterventionsController } from './controllers/interventions.controller';
import { AdminInterventionsController } from './controllers/admin-interventions.controller';
import { InterventionsPrismaRepository } from './repositories/interventions.prisma.repository';
import { CreateInterventionUseCase } from './use-cases/create-intervention.use-case';
import { GetClientInterventionsUseCase } from './use-cases/get-client-interventions.use-case';
import { CancelInterventionUseCase } from './use-cases/cancel-intervention.use-case';
import { GetAdminInterventionsUseCase } from './use-cases/get-admin-interventions.use-case';
import { GetAdminInterventionDetailUseCase } from './use-cases/get-admin-intervention-detail.use-case';
import { UploadInterventionPhotosUseCase } from './use-cases/upload-intervention-photos.use-case';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { StorageModule } from '../../shared/storage/storage.module';
import { StorageService } from '../../shared/storage/storage.service';

export const INTERVENTIONS_REPO = 'INTERVENTIONS_REPO';

@Module({
    imports: [EmailModule, StorageModule],
    controllers: [InterventionsController, AdminInterventionsController],
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
        {
            provide: GetAdminInterventionsUseCase,
            useFactory: (repo: InterventionsPrismaRepository) =>
                new GetAdminInterventionsUseCase(repo),
            inject: [INTERVENTIONS_REPO],
        },
        {
            provide: GetAdminInterventionDetailUseCase,
            useFactory: (repo: InterventionsPrismaRepository) =>
                new GetAdminInterventionDetailUseCase(repo),
            inject: [INTERVENTIONS_REPO],
        },
        {
            provide: UploadInterventionPhotosUseCase,
            useFactory: (
                repo: InterventionsPrismaRepository,
                storage: StorageService,
            ) => new UploadInterventionPhotosUseCase(repo, storage),
            inject: [INTERVENTIONS_REPO, StorageService],
        },
    ],
})
export class InterventionModule {}
