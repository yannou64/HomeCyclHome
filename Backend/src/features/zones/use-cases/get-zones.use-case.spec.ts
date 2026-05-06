import { IZonesRepository } from '../repositories/zones.repository.interface';
import { GetZonesUseCase } from './get-zones.use-case';

const mockZones = [
    {
        id: 'uuid-1',
        nom_zone: 'Lyon Centre',
        is_active: true,
        date_creation: new Date('2026-01-01'),
        points: [
            { latitude: 45.75, longitude: 4.83, ordre: 0 },
            { latitude: 45.76, longitude: 4.84, ordre: 1 },
            { latitude: 45.74, longitude: 4.85, ordre: 2 },
        ],
    },
    {
        id: 'uuid-2',
        nom_zone: 'Villeurbanne',
        is_active: false,
        date_creation: new Date('2026-02-01'),
        points: [
            { latitude: 45.77, longitude: 4.88, ordre: 0 },
            { latitude: 45.78, longitude: 4.89, ordre: 1 },
            { latitude: 45.76, longitude: 4.90, ordre: 2 },
        ],
    },
];

describe('GetZonesUseCase', () => {
    let useCase: GetZonesUseCase;
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
        useCase = new GetZonesUseCase(mockRepo);
    });

    it('devrait retourner toutes les zones avec leurs points', async () => {
        mockRepo.findAll.mockResolvedValue(mockZones);

        const result = await useCase.execute();

        expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockZones);
        expect(result).toHaveLength(2);
    });

    it('devrait retourner un tableau vide si aucune zone existe', async () => {
        mockRepo.findAll.mockResolvedValue([]);

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });
});