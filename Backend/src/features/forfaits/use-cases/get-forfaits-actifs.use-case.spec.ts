import { IForfaitsRepository } from '../repositories/forfaits.repository.interface';
import { GetForfaitsActifsUseCase } from './get-forfaits-actifs.use-case';

describe('GetForfaitsActifsUseCase', () => {
    let useCase: GetForfaitsActifsUseCase;
    let mockRepo: jest.Mocked<IForfaitsRepository>;

    beforeEach(() => {
        mockRepo = {
            findAll: jest.fn(),
            findAllActifs: jest.fn(),
            findById: jest.fn(),
            findByNom: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            setPrix: jest.fn(),
        };
        useCase = new GetForfaitsActifsUseCase(mockRepo);
    });

    it('devrait déléguer au repository et retourner les forfaits actifs', async () => {
        const forfaitsActifs = [
            {
                id: 'uuid-1',
                nom: 'Révision Express',
                description: null,
                dureeMinutes: 45,
                isActif: true,
                prixActif: 29.9,
            },
            {
                id: 'uuid-2',
                nom: 'Révision Standard',
                description: 'Entretien complet du vélo',
                dureeMinutes: 90,
                isActif: true,
                prixActif: 49.9,
            },
        ];
        mockRepo.findAllActifs.mockResolvedValue(forfaitsActifs);

        const result = await useCase.execute();

        expect(mockRepo.findAllActifs).toHaveBeenCalledTimes(1);
        expect(result).toEqual(forfaitsActifs);
    });

    it('ne devrait pas appeler findAll (qui retourne aussi les inactifs)', async () => {
        mockRepo.findAllActifs.mockResolvedValue([]);

        await useCase.execute();

        expect(mockRepo.findAll).not.toHaveBeenCalled();
    });
});
