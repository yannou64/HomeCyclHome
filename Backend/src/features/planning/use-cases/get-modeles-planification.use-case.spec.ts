import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { GetModelesPlanificationUseCase } from './get-modeles-planification.use-case';

const mockModele = {
    id: 'modele-uuid-1',
    technicienId: 'tech-uuid-1',
    zoneId: 'zone-uuid-1',
    jourSemaine: 1,
    heureDebut: 480,
    heureFin: 1020,
    intervalleMinutes: 60,
    isActif: true,
    dateDebutValidite: '2026-06-01T00:00:00.000Z',
    dateFinValidite: null,
};

describe('GetModelesPlanificationUseCase', () => {
    let useCase: GetModelesPlanificationUseCase;
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
        useCase = new GetModelesPlanificationUseCase(mockRepo);
    });

    it('devrait retourner la liste des modèles pour un technicien', async () => {
        mockRepo.findModelesByTechnicien.mockResolvedValue([mockModele]);

        const result = await useCase.execute('tech-uuid-1');

        expect(mockRepo.findModelesByTechnicien).toHaveBeenCalledWith(
            'tech-uuid-1',
        );
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('modele-uuid-1');
    });

    it("devrait retourner un tableau vide si le technicien n'a pas de modèle", async () => {
        mockRepo.findModelesByTechnicien.mockResolvedValue([]);

        const result = await useCase.execute('tech-uuid-2');

        expect(result).toEqual([]);
    });
});
