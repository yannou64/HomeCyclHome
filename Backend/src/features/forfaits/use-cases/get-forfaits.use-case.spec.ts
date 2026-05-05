import { IForfaitsRepository } from '../repositories/forfaits.repository.interface';
import { GetForfaitsUseCase } from './get-forfaits.use-case';

describe('GetForfaitsUseCase', () => {
    let useCase: GetForfaitsUseCase;
    let mockRepo: jest.Mocked<IForfaitsRepository>;

    beforeEach(() => {
        mockRepo = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByNom: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            setPrix: jest.fn(),
        };
        useCase = new GetForfaitsUseCase(mockRepo);
    });

    it('devrait retourner la liste complète des forfaits', async () => {
        const forfaits = [
            { id: 'uuid-1', nom: 'Révision Express', description: null, duree_minutes: 45, is_actif: true, prix_actif: null },
            { id: 'uuid-2', nom: 'Révision Standard', description: 'Entretien complet', duree_minutes: 90, is_actif: true, prix_actif: 49.90 },
        ];
        mockRepo.findAll.mockResolvedValue(forfaits);

        const result = await useCase.execute();

        expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
        expect(result).toEqual(forfaits);
    });
});