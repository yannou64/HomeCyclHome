import { NotFoundException } from '@nestjs/common';
import { IZonesRepository } from '../repositories/zones.repository.interface';
import { GetZoneByIdUseCase } from './get-zone-by-id.use-case';

const mockZone = {
    id: 'uuid-1',
    nom_zone: 'Lyon Centre',
    is_active: true,
    date_creation: new Date('2026-01-01'),
    points: [
        { latitude: 45.75, longitude: 4.83, ordre: 0 },
        { latitude: 45.76, longitude: 4.84, ordre: 1 },
        { latitude: 45.74, longitude: 4.85, ordre: 2 },
    ],
};

describe('GetZoneByIdUseCase', () => {
    let useCase: GetZoneByIdUseCase;
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
        useCase = new GetZoneByIdUseCase(mockRepo);
    });

    it("devrait retourner la zone correspondant à l'id", async () => {
        mockRepo.findById.mockResolvedValue(mockZone);

        const result = await useCase.execute('uuid-1');

        expect(mockRepo.findById).toHaveBeenCalledWith('uuid-1');
        expect(result).toEqual(mockZone);
    });

    it('devrait lever NotFoundException si la zone est introuvable', async () => {
        mockRepo.findById.mockResolvedValue(null);

        await expect(useCase.execute('ghost-uuid')).rejects.toThrow(
            NotFoundException,
        );
    });
});
