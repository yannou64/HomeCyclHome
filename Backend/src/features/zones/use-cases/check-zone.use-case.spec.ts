import { NotFoundException } from '@nestjs/common';
import { CheckZoneUseCase } from './check-zone.use-case';
import type { IZonesRepository } from '../repositories/zones.repository.interface';
import type { ZoneDto } from '../dto/zone.dto';

// Carré autour de Lyon-centre (lat 45.74–45.76, lng 4.83–4.87)
const makeZone = (overrides: Partial<ZoneDto> = {}): ZoneDto => ({
    id: 'zone-1',
    nomZone: 'Lyon Centre',
    isActive: true,
    dateCreation: new Date(),
    points: [
        { latitude: 45.76, longitude: 4.83, ordre: 0 },
        { latitude: 45.76, longitude: 4.87, ordre: 1 },
        { latitude: 45.74, longitude: 4.87, ordre: 2 },
        { latitude: 45.74, longitude: 4.83, ordre: 3 },
    ],
    ...overrides,
});

describe('CheckZoneUseCase', () => {
    let useCase: CheckZoneUseCase;
    let mockRepo: jest.Mocked<IZonesRepository>;

    beforeEach(() => {
        mockRepo = {
            findAll: jest.fn(),
            findAllActive: jest.fn(),
            findById: jest.fn(),
            existsByNom: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        useCase = new CheckZoneUseCase(mockRepo);
    });

    it(`devrait retourner la zone si le point est à l'intérieur du polygone`, async () => {
        mockRepo.findAllActive.mockResolvedValue([makeZone()]);

        // Point au centre du carré Lyon
        const result = await useCase.execute(45.75, 4.85);

        expect(result).toEqual({ zoneId: 'zone-1', nomZone: 'Lyon Centre' });
    });

    it(`devrait lever NotFoundException si le point est à l'extérieur de toutes les zones`, async () => {
        mockRepo.findAllActive.mockResolvedValue([makeZone()]);

        // Paris — clairement hors zone
        await expect(useCase.execute(48.85, 2.35)).rejects.toThrow(
            NotFoundException,
        );
    });

    it(`devrait lever NotFoundException si aucune zone active n'existe en base`, async () => {
        mockRepo.findAllActive.mockResolvedValue([]);

        await expect(useCase.execute(45.75, 4.85)).rejects.toThrow(
            NotFoundException,
        );
    });

    it('devrait retourner la bonne zone parmi plusieurs zones actives', async () => {
        const zoneLyon = makeZone({ id: 'zone-1', nomZone: 'Lyon Centre' });

        // Deuxième zone : carré autour de Villeurbanne (lat 45.77–45.79, lng 4.88–4.92)
        const zoneVilleurbanne = makeZone({
            id: 'zone-2',
            nomZone: 'Villeurbanne',
            points: [
                { latitude: 45.79, longitude: 4.88, ordre: 0 },
                { latitude: 45.79, longitude: 4.92, ordre: 1 },
                { latitude: 45.77, longitude: 4.92, ordre: 2 },
                { latitude: 45.77, longitude: 4.88, ordre: 3 },
            ],
        });

        mockRepo.findAllActive.mockResolvedValue([zoneLyon, zoneVilleurbanne]);

        // Point dans Villeurbanne uniquement
        const result = await useCase.execute(45.78, 4.9);

        expect(result).toEqual({ zoneId: 'zone-2', nomZone: 'Villeurbanne' });
    });
});
