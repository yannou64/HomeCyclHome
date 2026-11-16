import {
    ForbiddenException,
    BadRequestException,
    Injectable,
    Inject,
} from '@nestjs/common';
import {
    INTERVENTIONS_REPO,
    type IInterventionsRepository,
} from '../repositories/interventions.repository.interface';
import { StorageService } from '../../../shared/storage/storage.service';

const MAX_PHOTOS = 5;

@Injectable()
export class UploadInterventionPhotosUseCase {
    constructor(
        @Inject(INTERVENTIONS_REPO)
        private readonly repo: IInterventionsRepository,
        @Inject(StorageService)
        private readonly storage: Pick<StorageService, 'uploadFile'>,
    ) {}

    async execute(
        interventionId: string,
        clientId: string,
        files: Express.Multer.File[],
    ): Promise<{ count: number; urls: string[] }> {
        // 1. Vérifier la propriété de l'intervention
        const isOwner = await this.repo.isInterventionOwnedByClient(
            interventionId,
            clientId,
        );
        if (!isOwner)
            throw new ForbiddenException(
                "Vous n'avez pas accès à cette intervention.",
            );

        // 2. Vérifier la limite de 5 photos
        const existing = await this.repo.getPhotosCount(interventionId);
        if (existing + files.length > MAX_PHOTOS) {
            throw new BadRequestException(
                `Vous ne pouvez pas dépasser ${MAX_PHOTOS} photos par intervention. Il en reste ${MAX_PHOTOS - existing}.`,
            );
        }

        // 3. Uploader chaque fichier vers S3
        const folder = `interventions/${interventionId}`;
        const uploaded = await Promise.all(
            files.map((file) => this.storage.uploadFile(file, folder)),
        );

        // 4. Mapper vers le format du repository (urlS3 / cleS3) et persister
        await this.repo.createPhotos(
            interventionId,
            uploaded.map((u) => ({ urlS3: u.url, cleS3: u.cle })),
            'client',
        );

        return {
            count: uploaded.length,
            urls: uploaded.map((u) => u.url),
        };
    }
}
