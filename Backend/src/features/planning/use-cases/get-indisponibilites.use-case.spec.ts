import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { GetIndisponibilitesUseCase } from './get-indisponibilites.use-case';

describe('GetIndisponibilitesUseCase', () => {
    let useCase: GetIndisponibilitesUseCase;
    let mockRepo: jest.Mocked<IPlanningRepository>;

    beforeEach(() => {
        mockRepo = {
            findModelesByTechnicien: jest.fn(),
            findModeleById: jest.fn(),
            findModelesChevauchants: jest.fn(),
            createModele: jest.fn(),
            updateModele: jest.fn(),
            deleteModele: jest.fn(),
            findPausesByTechnicien: jest.fn(),
            findPauseById: jest.fn(),
            createPause: jest.fn(),
            deletePause: jest.fn(),
            findIndisponibilitesByTechnicien: jest.fn(),
            findIndisponibiliteById: jest.fn(),
            createIndisponibilite: jest.fn(),
            deleteIndisponibilite: jest.fn(),
            technicienExists: jest.fn(),
            isAffecteAZone: jest.fn(),
        };
        useCase = new GetIndisponibilitesUseCase(mockRepo);
    });

    it('devrait retourner les indisponibilités du technicien', async () => {
        const indispo = {
            id: 'indispo-1',
            technicien_id: 'tech-1',
            date_debut: '2026-07-14T00:00:00.000Z',
            date_fin: '2026-07-21T00:00:00.000Z',
            motif: 'Congés',
        };
        mockRepo.findIndisponibilitesByTechnicien.mockResolvedValue([indispo]);

        const result = await useCase.execute('tech-1');

        expect(mockRepo.findIndisponibilitesByTechnicien).toHaveBeenCalledWith(
            'tech-1',
        );
        expect(result).toHaveLength(1);
    });

    it('devrait retourner un tableau vide si aucune indisponibilité', async () => {
        mockRepo.findIndisponibilitesByTechnicien.mockResolvedValue([]);
        const result = await useCase.execute('tech-1');
        expect(result).toEqual([]);
    });
});
