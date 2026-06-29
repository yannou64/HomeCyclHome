import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { UploadInterventionPhotosUseCase } from './upload-intervention-photos.use-case';
import type { IInterventionsRepository } from '../repositories/interventions.repository.interface';
import type { StorageService } from '../../../shared/storage/storage.service';

const makeRepo = (
    overrides: Partial<IInterventionsRepository> = {},
): IInterventionsRepository =>
    ({
        isInterventionOwnedByClient: jest.fn().mockResolvedValue(true),
        getPhotosCount: jest.fn().mockResolvedValue(0),
        createPhotos: jest.fn().mockResolvedValue(undefined),
        ...overrides,
    }) as unknown as IInterventionsRepository;

const makeStorage = (): Pick<StorageService, 'uploadFile'> => ({
    uploadFile: jest.fn().mockResolvedValue({
        url: 'https://s3.example.com/photo.jpg',
        cle: 'interventions/abc/photo.jpg',
    }),
});

const fakeFile = {
    originalname: 'velo.jpg',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('x'),
} as Express.Multer.File;

describe('UploadInterventionPhotosUseCase', () => {
    it(`lève ForbiddenException si le client ne possède pas l'intervention`, async () => {
        const repo = makeRepo({
            isInterventionOwnedByClient: jest.fn().mockResolvedValue(false),
        });
        const useCase = new UploadInterventionPhotosUseCase(
            repo,
            makeStorage(),
        );

        await expect(
            useCase.execute('intervention-id', 'autre-client', [fakeFile]),
        ).rejects.toThrow(ForbiddenException);
    });

    it(`lève BadRequestException si le total de photos dépasse 5`, async () => {
        const repo = makeRepo({
            getPhotosCount: jest.fn().mockResolvedValue(4),
        });
        const useCase = new UploadInterventionPhotosUseCase(
            repo,
            makeStorage(),
        );

        // 4 existantes + 2 nouvelles = 6 → refus
        await expect(
            useCase.execute('intervention-id', 'client-id', [
                fakeFile,
                fakeFile,
            ]),
        ).rejects.toThrow(BadRequestException);
    });

    it(`uploade les fichiers et persiste les photos en base`, async () => {
        const repo = makeRepo();
        const storage = makeStorage();
        const useCase = new UploadInterventionPhotosUseCase(repo, storage);

        await useCase.execute('intervention-id', 'client-id', [
            fakeFile,
            fakeFile,
        ]);

        expect(storage.uploadFile).toHaveBeenCalledTimes(2);
        expect(repo.createPhotos).toHaveBeenCalledWith(
            'intervention-id',
            expect.arrayContaining([
                expect.objectContaining({
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    urlS3: expect.any(String),
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    cleS3: expect.any(String),
                }),
            ]),
            'client',
        );
    });
});
