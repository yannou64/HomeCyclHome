import { ConflictException } from '@nestjs/common';
import { IZonesRepository } from '../repositories/zones.repository.interface';
import { CreateZoneUseCase } from './create-zone.use-case';

const validPayload = {
    nom_zone: 'Lyon Centre',
    points: [
        { latitude: 45.75, longitude: 4.83, ordre: 0 },
        { latitude: 45.76, longitude: 4.84, ordre: 1 },
        { latitude: 45.74, longitude: 4.85, ordre: 2 },
    ],
};

describe('CreateZoneUseCase', () => {
    let useCase: CreateZoneUseCase;
    let mockRepo: jest.Mocked<IZonesRepository>;

    beforeEach(() => {
        mockRepo = {
            findAll: jest.fn(),
            findById: jest.fn(),
            existsByNom: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        useCase = new CreateZoneUseCase(mockRepo);
    });

    it('devrait créer une zone si le nom est disponible', async () => {
        mockRepo.existsByNom.mockResolvedValue(false);
        mockRepo.create.mockResolvedValue({
            id: 'new-uuid',
            ...validPayload,
            is_active: true,
            date_creation: new Date(),
        });

        const result = await useCase.execute(validPayload);

        expect(mockRepo.existsByNom).toHaveBeenCalledWith(
            validPayload.nom_zone,
        );
        expect(mockRepo.create).toHaveBeenCalledWith(validPayload);
        expect(result.id).toBe('new-uuid');
    });

    it('devrait lever ConflictException si le nom est déjà utilisé', async () => {
        mockRepo.existsByNom.mockResolvedValue(true);

        await expect(useCase.execute(validPayload)).rejects.toThrow(
            ConflictException,
        );
        expect(mockRepo.create).not.toHaveBeenCalled();
    });
});
