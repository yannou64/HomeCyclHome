import { ICyclesRepository } from '../repositories/cycles.repository.interface';
import { GetCyclesUseCase } from './get-cycles.use-case';

// Fabrique un CycleDto minimal réutilisable dans les tests
const makeCycle = (override = {}) => ({
    id: 'uuid-1',
    libelle: 'Mon VTT',
    particularite: null,
    dateCreation: new Date(),
    utilisateurId: 'user-1',
    marque: { id: 'marque-1', libelle: 'Trek' },
    typeCycle: { id: 'type-1', libelle: 'VTT' },
    ...override,
});

describe('GetCyclesUseCase', () => {
    let useCase: GetCyclesUseCase;
    let mockRepo: jest.Mocked<ICyclesRepository>;

    beforeEach(() => {
        mockRepo = {
            findAllByUser: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        useCase = new GetCyclesUseCase(mockRepo);
    });

    it("devrait retourner les cycles de l'utilisateur", async () => {
        const cycles = [
            makeCycle(),
            makeCycle({ id: 'uuid-2', particularite: 'roues 29"' }),
        ];
        mockRepo.findAllByUser.mockResolvedValue(cycles);

        const result = await useCase.execute('user-1');

        expect(mockRepo.findAllByUser).toHaveBeenCalledWith('user-1');
        expect(result).toEqual(cycles);
    });

    it("devrait retourner un tableau vide si l'utilisateur n'a pas de cycles", async () => {
        mockRepo.findAllByUser.mockResolvedValue([]);

        const result = await useCase.execute('user-1');

        expect(result).toEqual([]);
    });
});
