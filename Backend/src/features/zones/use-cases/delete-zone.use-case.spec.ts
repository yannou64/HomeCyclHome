import { NotFoundException } from '@nestjs/common';
import { IZonesRepository } from '../repositories/zones.repository.interface';
import { DeleteZoneUseCase } from './delete-zone.use-case';

describe('DeleteZoneUseCase', () => {
    let useCase: DeleteZoneUseCase;
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
        useCase = new DeleteZoneUseCase(mockRepo);
    });

    it('devrait supprimer une zone existante', async () => {
        mockRepo.findById.mockResolvedValue({
            id: 'uuid-1',
            nomZone: 'Lyon Centre',
            isActive: true,
            dateCreation: new Date('2026-01-01'),
            points: [
                { latitude: 45.75, longitude: 4.83, ordre: 0 },
                { latitude: 45.76, longitude: 4.84, ordre: 1 },
                { latitude: 45.74, longitude: 4.85, ordre: 2 },
            ],
        });

        await useCase.execute('uuid-1');

        expect(mockRepo.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('devrait lever NotFoundException si la zone est introuvable', async () => {
        mockRepo.findById.mockResolvedValue(null);

        await expect(useCase.execute('ghost-uuid')).rejects.toThrow(
            NotFoundException,
        );
        expect(mockRepo.delete).not.toHaveBeenCalled();
    });
});
