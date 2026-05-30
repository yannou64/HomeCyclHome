import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { GetPausesRecurrentesUseCase } from './get-pauses-recurrentes.use-case';

describe('GetPausesRecurrentesUseCase', () => {
    let useCase: GetPausesRecurrentesUseCase;
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
        useCase = new GetPausesRecurrentesUseCase(mockRepo);
    });

    it('devrait retourner les pauses du technicien', async () => {
        const pause = {
            id: 'pause-1',
            technicien_id: 'tech-1',
            jour_semaine: null,
            heure_debut: 720,
            heure_fin: 810,
            description: 'Déjeuner',
        };
        mockRepo.findPausesByTechnicien.mockResolvedValue([pause]);

        const result = await useCase.execute('tech-1');

        expect(mockRepo.findPausesByTechnicien).toHaveBeenCalledWith('tech-1');
        expect(result).toHaveLength(1);
    });

    it('devrait retourner un tableau vide si aucune pause', async () => {
        mockRepo.findPausesByTechnicien.mockResolvedValue([]);
        const result = await useCase.execute('tech-1');
        expect(result).toEqual([]);
    });
});
