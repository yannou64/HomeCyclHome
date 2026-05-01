import { ICyclesRepository } from '../repositories/cycles.repository.interface';
import { CreateCycleUseCase } from './create-cycle.use-case';

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

describe('CreateCycleUseCase', () => {
    let useCase: CreateCycleUseCase;
    let mockRepo: jest.Mocked<ICyclesRepository>;

    beforeEach(() => {
        mockRepo = {
            findAllByUser: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        useCase = new CreateCycleUseCase(mockRepo);
    });

    it("devrait créer un cycle pour l'utilisateur", async () => {
        const payload = {
            libelle: 'Mon VTT',
            marqueId: 'marque-1',
            typeCycleId: 'type-1',
            particularite: 'roues 29"',
        };
        const created = makeCycle({ particularite: 'roues 29"' });
        mockRepo.create.mockResolvedValue(created);

        const result = await useCase.execute('user-1', payload);

        expect(mockRepo.create).toHaveBeenCalledWith('user-1', payload);
        expect(result).toEqual(created);
    });

    it('devrait créer un cycle sans particularité', async () => {
        const payload = {
            libelle: 'Mon VTT',
            marqueId: 'marque-1',
            typeCycleId: 'type-1',
        };
        const created = makeCycle();
        mockRepo.create.mockResolvedValue(created);

        const result = await useCase.execute('user-1', payload);

        expect(mockRepo.create).toHaveBeenCalledWith('user-1', payload);
        expect(result).toEqual(created);
    });
});
