import { BadRequestException } from '@nestjs/common';
import { CreneauDto } from '../dto/planning.dto';
import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { GetCreneauxUseCase } from './get-creneaux.use-case';

const mockCreneau: CreneauDto = {
    id: 'creneau-uuid-1',
    dateDebut: '2026-06-01T09:00:00.000Z',
    dateFin: null,
    isDisponible: true,
    zoneId: 'zone-uuid',
    modelePlanificationId: 'modele-uuid',
};

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
        findCreneauxByTechnicien: jest.fn().mockResolvedValue([mockCreneau]),
        findCreneauById: jest.fn(),
        findCreneauxByZone: jest.fn(),
        deleteCreneau: jest.fn(),
        deleteCreneauxDisponibles: jest.fn(),
        ...overrides,
    };
}

describe('GetCreneauxUseCase', () => {
    let useCase: GetCreneauxUseCase;
    let mockRepo: jest.Mocked<IPlanningRepository>;

    beforeEach(() => {
        mockRepo = buildMockRepo();
        useCase = new GetCreneauxUseCase(mockRepo);
    });

    it('devrait retourner les créneaux du technicien sur la période', async () => {
        const result = await useCase.execute({
            technicienId: 'tech-uuid',
            dateDebut: '2026-06-01',
            dateFin: '2026-06-30',
        });

        expect(mockRepo.findCreneauxByTechnicien).toHaveBeenCalledWith(
            'tech-uuid',
            expect.any(Date),
            expect.any(Date),
        );
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('creneau-uuid-1');
    });

    it('devrait lever BadRequestException si technicienId est absent', async () => {
        await expect(
            useCase.execute({
                technicienId: '',
                dateDebut: '2026-06-01',
                dateFin: '2026-06-30',
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('devrait lever BadRequestException si dateFin est antérieure à dateDebut', async () => {
        await expect(
            useCase.execute({
                technicienId: 'tech-uuid',
                dateDebut: '2026-06-30',
                dateFin: '2026-06-01',
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('devrait retourner un tableau vide si aucun créneau sur la période', async () => {
        mockRepo.findCreneauxByTechnicien.mockResolvedValue([]);

        const result = await useCase.execute({
            technicienId: 'tech-uuid',
            dateDebut: '2026-06-01',
            dateFin: '2026-06-30',
        });

        expect(result).toEqual([]);
    });
});
