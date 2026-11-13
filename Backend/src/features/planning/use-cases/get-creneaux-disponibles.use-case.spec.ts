import { BadRequestException } from '@nestjs/common';
import { CreneauAvecTechnicien } from '../dto/output/creneau-response.dto';
import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { GetCreneauxDisponiblesUseCase } from './get-creneaux-disponibles.use-case';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Technicien = { id: string; prenom: string; modeleId: string };

const MARC: Technicien = {
    id: 'tech-a',
    prenom: 'Marc',
    modeleId: 'modele-a',
};
const JULIE: Technicien = {
    id: 'tech-b',
    prenom: 'Julie',
    modeleId: 'modele-b',
};

// Un slot de grille. L'heure est en UTC ; en juin, Paris est à UTC+2, donc
// 06:00Z correspond à 08:00 locales — sans importance pour ces tests, tout se
// joue le même jour calendaire.
function makeCreneau(
    heure: string,
    options: {
        technicien?: Technicien;
        disponible?: boolean;
        jour?: string;
    } = {},
): CreneauAvecTechnicien {
    const {
        technicien = MARC,
        disponible = true,
        jour = '2026-06-01',
    } = options;

    return {
        id: `${technicien.id}-${jour}-${heure}`,
        dateDebut: `${jour}T${heure}:00.000Z`,
        dateFin: null,
        isDisponible: disponible,
        zoneId: 'zone-uuid',
        modelePlanificationId: technicien.modeleId,
        technicienId: technicien.id,
        technicienPrenom: technicien.prenom,
        intervalleMinutes: 30,
    };
}

// Journée d'un technicien : 08:00 → 10:30, six slots de 30 minutes.
function journee(
    technicien: Technicien,
    options: { reserves?: string[]; jour?: string } = {},
): CreneauAvecTechnicien[] {
    const { reserves = [], jour } = options;
    return ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30'].map((heure) =>
        makeCreneau(heure, {
            technicien,
            disponible: !reserves.includes(heure),
            jour,
        }),
    );
}

// Le repository renvoie tous les créneaux de la zone triés par date, techniciens
// mélangés — c'est exactement ce que le use case doit savoir démêler.
function trierCommeLeRepo(
    creneaux: CreneauAvecTechnicien[],
): CreneauAvecTechnicien[] {
    return [...creneaux].sort((a, b) => {
        if (a.dateDebut !== b.dateDebut) {
            return a.dateDebut < b.dateDebut ? -1 : 1;
        }
        return (a.modelePlanificationId ?? '').localeCompare(
            b.modelePlanificationId ?? '',
        );
    });
}

function buildMockRepo(): jest.Mocked<IPlanningRepository> {
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

    const executer = (dureeMinutes = 30) =>
        useCase.execute({
            zoneId: 'zone-uuid',
            dureeMinutes,
            dateDebut: '2026-06-01',
            dateFin: '2026-06-02',
        });

    // ── Cas simples ───────────────────────────────────────────────────────────

    it('retourne un tableau vide si la zone ne contient aucun créneau', async () => {
        mockRepo.findCreneauxByZone.mockResolvedValue([]);

        expect(await executer()).toEqual([]);
    });

    it('propose toute la journée sauf le premier créneau', async () => {
        mockRepo.findCreneauxByZone.mockResolvedValue(journee(MARC));

        const result = await executer(30);

        // 08:00 est écarté : aucun buffer aller possible en début de journée.
        // 10:30 est proposé : dernier de la journée, le buffer retour n'est pas exigé.
        expect(result.map((c) => c.dateDebut)).toEqual([
            '2026-06-01T08:30:00.000Z',
            '2026-06-01T09:00:00.000Z',
            '2026-06-01T09:30:00.000Z',
            '2026-06-01T10:00:00.000Z',
            '2026-06-01T10:30:00.000Z',
        ]);
    });

    it('calcule dateFin en ajoutant la durée du forfait', async () => {
        mockRepo.findCreneauxByZone.mockResolvedValue(journee(MARC));

        const result = await executer(60);

        expect(result[0].dateDebut).toBe('2026-06-01T08:30:00.000Z');
        expect(result[0].dateFin).toBe('2026-06-01T09:30:00.000Z');
    });

    it('expose le prénom du technicien et la durée du slot', async () => {
        mockRepo.findCreneauxByZone.mockResolvedValue(journee(MARC));

        const result = await executer(30);

        expect(result[0].technicienPrenom).toBe('Marc');
        expect(result[0].technicienId).toBe('tech-a');
        expect(result[0].intervalleMinutes).toBe(30);
    });

    // ── Découpage par journée ─────────────────────────────────────────────────

    it('exclut le premier créneau de chaque journée', async () => {
        mockRepo.findCreneauxByZone.mockResolvedValue(
            trierCommeLeRepo([
                ...journee(MARC, { jour: '2026-06-01' }),
                ...journee(MARC, { jour: '2026-06-02' }),
            ]),
        );

        const result = await executer(30);
        const proposes = result.map((c) => c.dateDebut);

        expect(proposes).not.toContain('2026-06-01T08:00:00.000Z');
        expect(proposes).not.toContain('2026-06-02T08:00:00.000Z');
        expect(proposes).toContain('2026-06-02T08:30:00.000Z');
        expect(proposes).toHaveLength(10);
    });

    // ── Zone couverte par plusieurs techniciens ───────────────────────────────

    it('ne propose qu’un créneau par horaire quand deux techniciens sont libres', async () => {
        mockRepo.findCreneauxByZone.mockResolvedValue(
            trierCommeLeRepo([...journee(MARC), ...journee(JULIE)]),
        );

        const result = await executer(30);

        expect(result).toHaveLength(5);
        // tech-a passe avant tech-b dans l'ordre déterministe
        expect(result.every((c) => c.technicienPrenom === 'Marc')).toBe(true);
    });

    it("bascule sur l'autre technicien là où le premier est indisponible", async () => {
        // Marc a un rendez-vous à 09:00. Cela lui coûte 08:30 (plus de buffer
        // retour) et 09:30 (plus de buffer aller) — mais ne doit rien retirer à Julie.
        mockRepo.findCreneauxByZone.mockResolvedValue(
            trierCommeLeRepo([
                ...journee(MARC, { reserves: ['09:00'] }),
                ...journee(JULIE),
            ]),
        );

        const result = await executer(30);
        const parHoraire = Object.fromEntries(
            result.map((c) => [c.dateDebut.slice(11, 16), c.technicienPrenom]),
        );

        expect(parHoraire).toEqual({
            '08:30': 'Julie',
            '09:00': 'Julie',
            '09:30': 'Julie',
            '10:00': 'Marc',
            '10:30': 'Marc',
        });
    });

    it("n'invente pas de créneau quand tous les techniciens sont occupés", async () => {
        mockRepo.findCreneauxByZone.mockResolvedValue(
            trierCommeLeRepo([
                ...journee(MARC, {
                    reserves: [
                        '08:00',
                        '08:30',
                        '09:00',
                        '09:30',
                        '10:00',
                        '10:30',
                    ],
                }),
                ...journee(JULIE, {
                    reserves: [
                        '08:00',
                        '08:30',
                        '09:00',
                        '09:30',
                        '10:00',
                        '10:30',
                    ],
                }),
            ]),
        );

        expect(await executer(30)).toEqual([]);
    });

    // ── Validations ───────────────────────────────────────────────────────────

    it('lève BadRequestException si zoneId est vide', async () => {
        await expect(
            useCase.execute({
                zoneId: '',
                dureeMinutes: 60,
                dateDebut: '2026-06-01',
                dateFin: '2026-06-01',
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('lève BadRequestException si dureeMinutes est nul ou négatif', async () => {
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
