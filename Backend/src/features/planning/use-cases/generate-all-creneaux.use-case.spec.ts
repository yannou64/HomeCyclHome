import { ModelePlanificationDto } from '../dto/planning.dto';
import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { GenerateCreneauxUseCase } from './generate-creneaux.use-case';
import { GenerateAllCreneauxUseCase } from './generate-all-creneaux.use-case';

// ─── Données de test ─────────────────────────────────────────────────────────

const baseModele: ModelePlanificationDto = {
    id: 'modele-1',
    technicien_id: 'tech-uuid',
    zone_id: 'zone-uuid',
    jour_semaine: 0,
    heure_debut: 540,
    heure_fin: 660,
    intervalle_minutes: 30,
    is_actif: true,
    date_debut_validite: '2026-06-01T00:00:00.000Z',
    date_fin_validite: null,
};

const modele2: ModelePlanificationDto = {
    ...baseModele,
    id: 'modele-2',
    jour_semaine: 2,
};
const modeleInactif: ModelePlanificationDto = {
    ...baseModele,
    id: 'modele-3',
    is_actif: false,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildMockRepo(
    overrides: Partial<jest.Mocked<IPlanningRepository>> = {},
): jest.Mocked<IPlanningRepository> {
    return {
        findModelesByTechnicien: jest.fn().mockResolvedValue([]),
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
        findCreneauxDateDebutByModele: jest.fn(),
        countCreneauxConflits: jest.fn(),
        createManyCreneaux: jest.fn(),
        findCreneauxByTechnicien: jest.fn(),
        findCreneauById: jest.fn(),
        deleteCreneau: jest.fn(),
        deleteCreneauxDisponibles: jest.fn(),
        ...overrides,
    };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('GenerateAllCreneauxUseCase', () => {
    let useCase: GenerateAllCreneauxUseCase;
    let mockRepo: jest.Mocked<IPlanningRepository>;
    let mockGenerateUseCase: jest.Mocked<
        Pick<GenerateCreneauxUseCase, 'execute'>
    >;

    beforeEach(() => {
        mockRepo = buildMockRepo();
        mockGenerateUseCase = { execute: jest.fn() };
        useCase = new GenerateAllCreneauxUseCase(
            mockRepo,
            mockGenerateUseCase as unknown as GenerateCreneauxUseCase,
        );
    });

    it('devrait générer pour tous les modèles actifs et agréger les rapports', async () => {
        mockRepo.findModelesByTechnicien.mockResolvedValue([
            baseModele,
            modele2,
        ]);
        mockGenerateUseCase.execute
            .mockResolvedValueOnce({ created: 4, skipped: 0, conflicts: 0 })
            .mockResolvedValueOnce({ created: 6, skipped: 2, conflicts: 1 });

        const rapport = await useCase.execute({ technicienId: 'tech-uuid' });

        expect(mockGenerateUseCase.execute).toHaveBeenCalledTimes(2);
        expect(rapport).toEqual({ created: 10, skipped: 2, conflicts: 1 });
    });

    it('devrait ignorer les modèles inactifs', async () => {
        mockRepo.findModelesByTechnicien.mockResolvedValue([modeleInactif]);

        const rapport = await useCase.execute({ technicienId: 'tech-uuid' });

        expect(mockGenerateUseCase.execute).not.toHaveBeenCalled();
        expect(rapport).toEqual({ created: 0, skipped: 0, conflicts: 0 });
    });

    it('devrait retourner un rapport vide si aucun modèle', async () => {
        mockRepo.findModelesByTechnicien.mockResolvedValue([]);

        const rapport = await useCase.execute({ technicienId: 'tech-uuid' });

        expect(rapport).toEqual({ created: 0, skipped: 0, conflicts: 0 });
    });

    it('devrait transmettre date_fin_generation à chaque generate use case', async () => {
        mockRepo.findModelesByTechnicien.mockResolvedValue([baseModele]);
        mockGenerateUseCase.execute.mockResolvedValue({
            created: 4,
            skipped: 0,
            conflicts: 0,
        });

        await useCase.execute({
            technicienId: 'tech-uuid',
            date_fin_generation: '2026-08-01',
        });

        expect(mockGenerateUseCase.execute).toHaveBeenCalledWith({
            modele_id: 'modele-1',
            date_fin_generation: '2026-08-01',
        });
    });

    it('devrait mélanger actifs et inactifs — ne générer que pour les actifs', async () => {
        mockRepo.findModelesByTechnicien.mockResolvedValue([
            baseModele,
            modeleInactif,
            modele2,
        ]);
        mockGenerateUseCase.execute.mockResolvedValue({
            created: 3,
            skipped: 0,
            conflicts: 0,
        });

        const rapport = await useCase.execute({ technicienId: 'tech-uuid' });

        expect(mockGenerateUseCase.execute).toHaveBeenCalledTimes(2); // baseModele + modele2
        expect(rapport.created).toBe(6); // 3 + 3
    });
});
