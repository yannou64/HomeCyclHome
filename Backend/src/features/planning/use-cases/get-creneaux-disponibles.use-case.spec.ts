import { BadRequestException } from '@nestjs/common';
import { CreneauAvecTechnicienDto } from '../dto/planning.dto';
import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { GetCreneauxDisponiblesUseCase } from './get-creneaux-disponibles.use-case';

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Crée un créneau de test à une heure donnée (ex: '09:00') le 2026-06-01
function makeCreneau(
    heure: string,
    disponible = true,
    id?: string,
    intervalleMinutes = 60,
): CreneauAvecTechnicienDto {
    return {
        id: id ?? `creneau-${heure}`,
        dateDebut: `2026-06-01T${heure}:00.000Z`,
        dateFin: null,
        isDisponible: disponible,
        zoneId: 'zone-uuid',
        modelePlanificationId: 'modele-uuid',
        technicienId: 'tech-uuid',
        intervalleMinutes,
    };
}

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
        findCreneauxByZone: jest.fn().mockResolvedValue([]),
        deleteCreneau: jest.fn(),
        deleteCreneauxDisponibles: jest.fn(),
        ...overrides,
    };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('GetCreneauxDisponiblesUseCase', () => {
    let useCase: GetCreneauxDisponiblesUseCase;
    let mockRepo: jest.Mocked<IPlanningRepository>;

    beforeEach(() => {
        mockRepo = buildMockRepo();
        useCase = new GetCreneauxDisponiblesUseCase(mockRepo);
    });

    // ── Happy path ────────────────────────────────────────────────────────────

    it('devrait retourner les créneaux proposables quand buffers et durée respectés', async () => {
        // Séquence : [08:00 dispo] [09:00 dispo] [09:30 dispo] [10:00 dispo]
        // Forfait 30 min → 1 slot : buffer[08:00] + intervention[09:00] + buffer[09:30] ✓
        // Forfait 30 min → 1 slot : buffer[09:00] + intervention[09:30] + buffer[10:00] ✓
        const creneaux = [
            makeCreneau('08:00'),
            makeCreneau('09:00'),
            makeCreneau('09:30'),
            makeCreneau('10:00'),
        ];
        mockRepo.findCreneauxByZone.mockResolvedValue(creneaux);

        const result = await useCase.execute({
            zoneId: 'zone-uuid',
            dureeMinutes: 30,
            dateDebut: '2026-06-01',
            dateFin: '2026-06-01',
        });

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('creneau-09:00');
        expect(result[1].id).toBe('creneau-09:30');
    });

    it('devrait calculer date_fin en ajoutant dureeMinutes à date_debut', async () => {
        const creneaux = [
            makeCreneau('08:00'),
            makeCreneau('09:00'),
            makeCreneau('10:00'),
        ];
        mockRepo.findCreneauxByZone.mockResolvedValue(creneaux);

        const result = await useCase.execute({
            zoneId: 'zone-uuid',
            dureeMinutes: 60,
            dateDebut: '2026-06-01',
            dateFin: '2026-06-01',
        });

        // dateFin = 09:00 + 60min = 10:00
        expect(result).toHaveLength(1);
        expect(result[0].dateFin).toBe('2026-06-01T10:00:00.000Z');
    });

    it('devrait retourner un tableau vide si aucun créneau dans la zone', async () => {
        mockRepo.findCreneauxByZone.mockResolvedValue([]);

        const result = await useCase.execute({
            zoneId: 'zone-uuid',
            dureeMinutes: 60,
            dateDebut: '2026-06-01',
            dateFin: '2026-06-01',
        });

        expect(result).toEqual([]);
    });

    // ── Règles buffer ─────────────────────────────────────────────────────────

    it('devrait exclure un créneau quand le buffer avant est réservé', async () => {
        // [08:00 RÉSERVÉ] [09:00 dispo] [10:00 dispo]
        // → pas de buffer avant pour 09:00
        const creneaux = [
            makeCreneau('08:00', false),
            makeCreneau('09:00'),
            makeCreneau('10:00'),
        ];
        mockRepo.findCreneauxByZone.mockResolvedValue(creneaux);

        const result = await useCase.execute({
            zoneId: 'zone-uuid',
            dureeMinutes: 60,
            dateDebut: '2026-06-01',
            dateFin: '2026-06-01',
        });

        expect(result).toHaveLength(0);
    });

    it('devrait exclure un créneau quand le buffer après est réservé', async () => {
        // [08:00 dispo] [09:00 dispo] [10:00 RÉSERVÉ]
        // → pas de buffer après pour 09:00
        const creneaux = [
            makeCreneau('08:00'),
            makeCreneau('09:00'),
            makeCreneau('10:00', false),
        ];
        mockRepo.findCreneauxByZone.mockResolvedValue(creneaux);

        const result = await useCase.execute({
            zoneId: 'zone-uuid',
            dureeMinutes: 60,
            dateDebut: '2026-06-01',
            dateFin: '2026-06-01',
        });

        expect(result).toHaveLength(0);
    });

    it('devrait exclure un créneau quand un slot intermédiaire est réservé', async () => {
        // [08:00 dispo] [09:00 dispo] [09:30 RÉSERVÉ] [10:00 dispo]
        // Forfait 60min → slots 09:00 + 09:30 : 09:30 est réservé → exclu
        const creneaux = [
            makeCreneau('08:00'),
            makeCreneau('09:00'),
            makeCreneau('09:30', false),
            makeCreneau('10:00'),
        ];
        mockRepo.findCreneauxByZone.mockResolvedValue(creneaux);

        const result = await useCase.execute({
            zoneId: 'zone-uuid',
            dureeMinutes: 60,
            dateDebut: '2026-06-01',
            dateFin: '2026-06-01',
        });

        expect(result).toHaveLength(0);
    });

    it('devrait exclure un créneau dont le buffer avant est séparé par un trou (pause)', async () => {
        // Pause 12h-14h → [11:00, 11:30, 14:00, 14:30] (trou de 2h30 entre 11:30 et 14:00)
        // 14:00 ne doit PAS être proposé : le buffer avant (11:30) n'est pas contigu
        // 11:30 DOIT être proposé : buffer avant=11:00 (30 min ≤ 30 min ✓), buffer après=14:00 (disponible ✓)
        const creneaux = [
            makeCreneau('11:00', true, undefined, 30),
            makeCreneau('11:30', true, undefined, 30),
            makeCreneau('14:00', true, undefined, 30),
            makeCreneau('14:30', true, undefined, 30),
        ];
        mockRepo.findCreneauxByZone.mockResolvedValue(creneaux);

        const result = await useCase.execute({
            zoneId: 'zone-uuid',
            dureeMinutes: 30,
            dateDebut: '2026-06-01',
            dateFin: '2026-06-01',
        });

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('creneau-11:30');
    });

    // ── Validations ───────────────────────────────────────────────────────────

    it('devrait lever BadRequestException si zoneId est vide', async () => {
        await expect(
            useCase.execute({
                zoneId: '',
                dureeMinutes: 60,
                dateDebut: '2026-06-01',
                dateFin: '2026-06-01',
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('devrait lever BadRequestException si dureeMinutes est inférieur ou égal à zéro', async () => {
        await expect(
            useCase.execute({
                zoneId: 'zone-uuid',
                dureeMinutes: 0,
                dateDebut: '2026-06-01',
                dateFin: '2026-06-01',
            }),
        ).rejects.toThrow(BadRequestException);
    });
});
