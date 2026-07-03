import { BadRequestException } from '@nestjs/common';
import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { DeleteCreneauxDisponiblesUseCase } from './delete-creneaux-disponibles.use-case';

// ─── Helper ──────────────────────────────────────────────────────────────────

function buildMockRepo(
    overrides: Partial<jest.Mocked<IPlanningRepository>> = {},
): jest.Mocked<IPlanningRepository> {
    return {
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
        findCreneauxDateDebutByModele: jest.fn(),
        countCreneauxConflits: jest.fn(),
        createManyCreneaux: jest.fn(),
        findCreneauxByTechnicien: jest.fn(),
        findCreneauById: jest.fn(),
        findCreneauxByZone: jest.fn(),
        deleteCreneau: jest.fn(),
        deleteCreneauxDisponibles: jest.fn().mockResolvedValue(0),
        ...overrides,
    };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('DeleteCreneauxDisponiblesUseCase', () => {
    let useCase: DeleteCreneauxDisponiblesUseCase;
    let mockRepo: jest.Mocked<IPlanningRepository>;

    beforeEach(() => {
        mockRepo = buildMockRepo();
        useCase = new DeleteCreneauxDisponiblesUseCase(mockRepo);
    });

    it('devrait supprimer les créneaux disponibles et retourner le count', async () => {
        mockRepo.deleteCreneauxDisponibles.mockResolvedValue(12);

        const result = await useCase.execute({
            technicienId: 'tech-uuid',
            dateDebut: '2026-06-01',
            dateFin: '2026-06-30',
        });

        expect(mockRepo.deleteCreneauxDisponibles).toHaveBeenCalledTimes(1);
        expect(result.deleted).toBe(12);
    });

    it('devrait appeler le repository avec les bonnes bornes de date', async () => {
        mockRepo.deleteCreneauxDisponibles.mockResolvedValue(5);

        await useCase.execute({
            technicienId: 'tech-uuid',
            dateDebut: '2026-06-01',
            dateFin: '2026-06-30',
        });

        const [techId, debut, fin] =
            mockRepo.deleteCreneauxDisponibles.mock.calls[0];
        expect(techId).toBe('tech-uuid');
        // dateDebut → début de journée
        expect(debut.getUTCHours()).toBe(0);
        expect(debut.getUTCMinutes()).toBe(0);
        // dateFin → fin de journée
        expect(fin.getUTCHours()).toBe(23);
        expect(fin.getUTCMinutes()).toBe(59);
    });

    it('devrait lever BadRequestException si technicienId est vide', async () => {
        await expect(
            useCase.execute({
                technicienId: '',
                dateDebut: '2026-06-01',
                dateFin: '2026-06-30',
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('devrait lever BadRequestException si dateFin < dateDebut', async () => {
        await expect(
            useCase.execute({
                technicienId: 'tech-uuid',
                dateDebut: '2026-06-30',
                dateFin: '2026-06-01',
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('devrait retourner 0 si aucun créneau disponible sur la période', async () => {
        mockRepo.deleteCreneauxDisponibles.mockResolvedValue(0);

        const result = await useCase.execute({
            technicienId: 'tech-uuid',
            dateDebut: '2026-06-01',
            dateFin: '2026-06-30',
        });

        expect(result.deleted).toBe(0);
    });
});
