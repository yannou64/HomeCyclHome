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
import { StorageModule } from '../../shared/storage/storage.module';
import { INTERVENTIONS_REPO } from './repositories/interventions.repository.interface';

@Module({
    imports: [EmailModule, StorageModule],
    controllers: [InterventionsController, AdminInterventionsController],
    providers: [
        {
            provide: INTERVENTIONS_REPO,
            useClass: InterventionsPrismaRepository,
        },
        CreateInterventionUseCase,
        GetClientInterventionsUseCase,
        CancelInterventionUseCase,
        GetAdminInterventionsUseCase,
        GetAdminInterventionDetailUseCase,
        UploadInterventionPhotosUseCase,
    ],
})
export class InterventionModule {}
