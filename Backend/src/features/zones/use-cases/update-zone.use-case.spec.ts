import { ConflictException, NotFoundException } from '@nestjs/common';
import { IZonesRepository } from '../repositories/zones.repository.interface';
import { UpdateZoneUseCase } from './update-zone.use-case';

const existingZone = {
    id: 'uuid-1',
    nomZone: 'Lyon Centre',
    isActive: true,
    dateCreation: new Date('2026-01-01'),
    points: [
        { latitude: 45.75, longitude: 4.83, ordre: 0 },
        { latitude: 45.76, longitude: 4.84, ordre: 1 },
        { latitude: 45.74, longitude: 4.85, ordre: 2 },
    ],
};

describe('UpdateZoneUseCase', () => {
    let useCase: UpdateZoneUseCase;
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
        useCase = new UpdateZoneUseCase(mockRepo);
    });

    it('devrait mettre à jour une zone existante', async () => {
        mockRepo.findById.mockResolvedValue(existingZone);
        mockRepo.update.mockResolvedValue({
            ...existingZone,
            isActive: false,
        });

        const result = await useCase.execute('uuid-1', { isActive: false });

        expect(mockRepo.update).toHaveBeenCalledWith('uuid-1', {
            isActive: false,
        });
        expect(result.isActive).toBe(false);
    });

    it('devrait lever NotFoundException si la zone est introuvable', async () => {
        mockRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute('ghost-uuid', { isActive: false }),
        ).rejects.toThrow(NotFoundException);
        expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('devrait lever ConflictException si le nouveau nom est déjà pris par une autre zone', async () => {
        mockRepo.findById.mockResolvedValue(existingZone);
        // existsByNom exclut l'id courant mais trouve quand même un conflit
        mockRepo.existsByNom.mockResolvedValue(true);

        await expect(
            useCase.execute('uuid-1', { nomZone: 'Villeurbanne' }),
        ).rejects.toThrow(ConflictException);
        expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it("devrait autoriser la mise à jour du nom si c'est la même zone", async () => {
        mockRepo.findById.mockResolvedValue(existingZone);
        // excludeId='uuid-1' → aucun autre conflit trouvé
        mockRepo.existsByNom.mockResolvedValue(false);
        mockRepo.update.mockResolvedValue({
            ...existingZone,
            nomZone: 'Lyon Centre v2',
        });

        await useCase.execute('uuid-1', { nomZone: 'Lyon Centre v2' });

        expect(mockRepo.existsByNom).toHaveBeenCalledWith(
            'Lyon Centre v2',
            'uuid-1',
        );
        expect(mockRepo.update).toHaveBeenCalled();
    });

    it('devrait remplacer les points si de nouveaux points sont fournis', async () => {
        const newPoints = [
            { latitude: 45.8, longitude: 4.9, ordre: 0 },
            { latitude: 45.81, longitude: 4.91, ordre: 1 },
            { latitude: 45.79, longitude: 4.92, ordre: 2 },
        ];
        mockRepo.findById.mockResolvedValue(existingZone);
        mockRepo.update.mockResolvedValue({
            ...existingZone,
            points: newPoints,
        });

        const result = await useCase.execute('uuid-1', { points: newPoints });

        expect(mockRepo.update).toHaveBeenCalledWith('uuid-1', {
            points: newPoints,
        });
        expect(result.points).toEqual(newPoints);
    });
});
