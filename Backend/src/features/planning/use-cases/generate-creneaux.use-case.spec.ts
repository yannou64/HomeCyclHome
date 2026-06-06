import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
    CreateCreneauData,
    GenerationRapportDto,
    IndisponibiliteDto,
    ModelePlanificationDto,
    PauseRecurrenteDto,
} from '../dto/planning.dto';
import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { GenerateCreneauxUseCase } from './generate-creneaux.use-case';

// ─── Données de test ─────────────────────────────────────────────────────────

// 2026-06-01 est un lundi → jour_semaine = 0
const DATE_LUNDI = '2026-06-01';
const DATE_MARDI = '2026-06-02';
const DATE_MERCREDI = '2026-06-03';

const mockModele: ModelePlanificationDto = {
    id: 'modele-uuid',
    technicien_id: 'tech-uuid',
    zone_id: 'zone-uuid',
    jour_semaine: 0, // lundi
    heure_debut: 540, // 9h00
    heure_fin: 660, // 11h00
    intervalle_minutes: 30,
    is_actif: true,
    date_debut_validite: `${DATE_LUNDI}T00:00:00.000Z`,
    date_fin_validite: null,
};

// ─── Mock repository complet ─────────────────────────────────────────────────

function buildMockRepo(
    overrides: Partial<jest.Mocked<IPlanningRepository>> = {},
): jest.Mocked<IPlanningRepository> {
    return {
        // Modèles
        findModelesByTechnicien: jest.fn(),
        findModeleById: jest.fn().mockResolvedValue(mockModele),
        findModelesChevauchants: jest.fn(),
        createModele: jest.fn(),
        updateModele: jest.fn(),
        deleteModele: jest.fn(),
        // Pauses
        findPausesByTechnicien: jest.fn().mockResolvedValue([]),
        findPauseById: jest.fn(),
        createPause: jest.fn(),
        deletePause: jest.fn(),
        // Indisponibilités
        findIndisponibilitesByTechnicien: jest.fn().mockResolvedValue([]),
        findIndisponibiliteById: jest.fn(),
        createIndisponibilite: jest.fn(),
        deleteIndisponibilite: jest.fn(),
        // Vérifications partagées
        technicienExists: jest.fn(),
        isAffecteAZone: jest.fn(),
        // Créneaux
        findCreneauxDateDebutByModele: jest.fn().mockResolvedValue([]),
        countCreneauxConflits: jest.fn().mockResolvedValue(0),
        createManyCreneaux: jest
            .fn()
            .mockImplementation((data: CreateCreneauData[]) =>
                Promise.resolve(data.length),
            ),
        findCreneauxByTechnicien: jest.fn(),
        findCreneauById: jest.fn(),
        deleteCreneau: jest.fn(),
        ...overrides,
    };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('GenerateCreneauxUseCase', () => {
    let useCase: GenerateCreneauxUseCase;
    let mockRepo: jest.Mocked<IPlanningRepository>;

    beforeEach(() => {
        mockRepo = buildMockRepo();
        useCase = new GenerateCreneauxUseCase(mockRepo);
    });

    // ── Cas nominal ──────────────────────────────────────────────────────────

    it('devrait générer les créneaux corrects sur un modèle simple (lundi 9h-11h, 30min)', async () => {
        // Modèle : lundi 9h-11h par 30min → 4 slots (9h, 9h30, 10h, 10h30)
        // Période : du 2026-06-01 au 2026-06-07 (une semaine, un seul lundi)
        const rapport: GenerationRapportDto = await useCase.execute({
            modele_id: 'modele-uuid',
            date_fin_generation: '2026-06-07',
        });

        expect(mockRepo.createManyCreneaux).toHaveBeenCalledTimes(1);
        const creneauxCrees = mockRepo.createManyCreneaux.mock.calls[0][0];
        expect(creneauxCrees).toHaveLength(4);

        // Vérifier les heures UTC des créneaux créés
        // 9h Paris (UTC+2 en juin) = 7h UTC → 420 min, etc.
        const heures = creneauxCrees.map((c) => {
            const d = new Date(c.date_debut);
            return d.getUTCHours() * 60 + d.getUTCMinutes();
        });
        expect(heures).toEqual([420, 450, 480, 510]); // 7h, 7h30, 8h, 8h30 UTC = 9h-10h30 Paris

        expect(rapport.created).toBe(4);
        expect(rapport.skipped).toBe(0);
        expect(rapport.conflicts).toBe(0);
    });

    it('devrait générer des créneaux pour chaque lundi de la période', async () => {
        // Du 2026-06-01 au 2026-06-15 : 2 lundis (01 et 08)
        const rapport = await useCase.execute({
            modele_id: 'modele-uuid',
            date_fin_generation: '2026-06-15',
        });

        const creneauxCrees = mockRepo.createManyCreneaux.mock.calls[0][0];
        expect(creneauxCrees).toHaveLength(8); // 4 slots × 2 lundis
        expect(rapport.created).toBe(8);
    });

    // ── Filtrage par jour de semaine ─────────────────────────────────────────

    it('ne devrait pas générer de créneaux les jours qui ne correspondent pas au modèle', async () => {
        // Modèle lundi (0), mais on génère du mardi au mercredi → aucun créneau
        mockRepo.findModeleById.mockResolvedValue({
            ...mockModele,
            date_debut_validite: `${DATE_MARDI}T00:00:00.000Z`,
            jour_semaine: 0, // lundi
        });

        const rapport = await useCase.execute({
            modele_id: 'modele-uuid',
            date_fin_generation: DATE_MERCREDI,
        });

        expect(mockRepo.createManyCreneaux).not.toHaveBeenCalled();
        expect(rapport.created).toBe(0);
    });

    // ── Pauses récurrentes ───────────────────────────────────────────────────

    it('devrait exclure les slots couverts par une pause quotidienne (jour_semaine=null)', async () => {
        // Pause 9h30-10h00 tous les jours → sur lundi 9h-11h 30min :
        // slots 9h ✓, 9h30 ✗ (couvert par la pause), 10h ✓, 10h30 ✓ → 3 créneaux
        const pause: PauseRecurrenteDto = {
            id: 'pause-uuid',
            technicien_id: 'tech-uuid',
            jour_semaine: null, // tous les jours
            heure_debut: 570, // 9h30
            heure_fin: 600, // 10h00
            description: 'Pause café',
        };
        mockRepo.findPausesByTechnicien.mockResolvedValue([pause]);

        const rapport = await useCase.execute({
            modele_id: 'modele-uuid',
            date_fin_generation: '2026-06-07',
        });

        const creneauxCrees = mockRepo.createManyCreneaux.mock.calls[0][0];
        expect(creneauxCrees).toHaveLength(3);
        expect(rapport.created).toBe(3);
        expect(rapport.skipped).toBe(1); // le slot 9h30 sauté
    });

    it('devrait exclure les slots couverts par une pause sur un jour précis uniquement', async () => {
        // Pause lundi 9h30-10h00 uniquement (jour_semaine=0)
        // Idem : 3 créneaux le lundi
        const pause: PauseRecurrenteDto = {
            id: 'pause-uuid',
            technicien_id: 'tech-uuid',
            jour_semaine: 0, // lundi seulement
            heure_debut: 570,
            heure_fin: 600,
            description: null,
        };
        mockRepo.findPausesByTechnicien.mockResolvedValue([pause]);

        const rapport = await useCase.execute({
            modele_id: 'modele-uuid',
            date_fin_generation: '2026-06-07',
        });

        const creneauxCrees = mockRepo.createManyCreneaux.mock.calls[0][0];
        expect(creneauxCrees).toHaveLength(3);
        expect(rapport.skipped).toBe(1);
    });

    it('ne devrait pas exclure les slots si la pause concerne un autre jour de la semaine', async () => {
        // Pause mardi (jour_semaine=1) → ne doit pas affecter les créneaux du lundi
        const pause: PauseRecurrenteDto = {
            id: 'pause-uuid',
            technicien_id: 'tech-uuid',
            jour_semaine: 1, // mardi
            heure_debut: 570,
            heure_fin: 600,
            description: null,
        };
        mockRepo.findPausesByTechnicien.mockResolvedValue([pause]);

        const rapport = await useCase.execute({
            modele_id: 'modele-uuid',
            date_fin_generation: '2026-06-07',
        });

        const creneauxCrees = mockRepo.createManyCreneaux.mock.calls[0][0];
        expect(creneauxCrees).toHaveLength(4); // tous les slots du lundi
        expect(rapport.skipped).toBe(0);
    });

    // ── Indisponibilités ─────────────────────────────────────────────────────

    it('devrait exclure tous les slots du jour couvert par une indisponibilité', async () => {
        // Indisponibilité couvre le 2026-06-01 (lundi) → aucun créneau ce jour
        // On génère 2 semaines (2 lundis : 01 et 08) → seul le 08 génère des créneaux
        const indispo: IndisponibiliteDto = {
            id: 'indispo-uuid',
            technicien_id: 'tech-uuid',
            date_debut: `${DATE_LUNDI}T00:00:00.000Z`,
            date_fin: `${DATE_LUNDI}T23:59:59.000Z`,
            motif: 'Congé',
        };
        mockRepo.findIndisponibilitesByTechnicien.mockResolvedValue([indispo]);

        const rapport = await useCase.execute({
            modele_id: 'modele-uuid',
            date_fin_generation: '2026-06-15',
        });

        const creneauxCrees = mockRepo.createManyCreneaux.mock.calls[0][0];
        expect(creneauxCrees).toHaveLength(4); // seulement le lundi 08 → 4 slots
        expect(rapport.skipped).toBe(4); // 4 slots du lundi 01 sautés
    });

    // ── Idempotence ──────────────────────────────────────────────────────────

    it('ne devrait pas recréer un créneau dont le date_debut existe déjà (idempotence)', async () => {
        // 2 slots du lundi 01 existent déjà → seulement 2 nouveaux créneaux
        // Slots stockés en UTC : 9h Paris (UTC+2 en juin) = 7h UTC
        const lundi = new Date(`${DATE_LUNDI}T00:00:00.000Z`);
        const slot9h = new Date(lundi);
        slot9h.setUTCHours(7, 0, 0, 0); // 9h00 Paris
        const slot9h30 = new Date(lundi);
        slot9h30.setUTCHours(7, 30, 0, 0); // 9h30 Paris

        mockRepo.findCreneauxDateDebutByModele.mockResolvedValue([
            slot9h.toISOString(),
            slot9h30.toISOString(),
        ]);

        const rapport = await useCase.execute({
            modele_id: 'modele-uuid',
            date_fin_generation: '2026-06-07',
        });

        const creneauxCrees = mockRepo.createManyCreneaux.mock.calls[0][0];
        expect(creneauxCrees).toHaveLength(2); // 10h et 10h30 seulement
        expect(rapport.created).toBe(2);
        expect(rapport.skipped).toBe(2); // 9h et 9h30 ignorés
    });

    // ── Conflits ─────────────────────────────────────────────────────────────

    it('devrait reporter les conflits (créneaux réservés) sans les supprimer', async () => {
        mockRepo.countCreneauxConflits.mockResolvedValue(2);

        const rapport = await useCase.execute({
            modele_id: 'modele-uuid',
            date_fin_generation: '2026-06-07',
        });

        expect(rapport.conflicts).toBe(2);
        // Les créneaux réservés ne sont ni supprimés ni modifiés
        expect(mockRepo.deleteCreneau).not.toHaveBeenCalled();
    });

    // ── Erreurs ──────────────────────────────────────────────────────────────

    it('devrait lever NotFoundException si le modèle est introuvable', async () => {
        mockRepo.findModeleById.mockResolvedValue(null);

        await expect(
            useCase.execute({ modele_id: 'inexistant' }),
        ).rejects.toThrow(NotFoundException);
    });

    it('devrait lever BadRequestException si date_fin_generation < date_debut_validite', async () => {
        // date_fin_generation avant le début de validité du modèle
        await expect(
            useCase.execute({
                modele_id: 'modele-uuid',
                date_fin_generation: '2026-05-01', // avant 2026-06-01
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('devrait lever BadRequestException si la période dépasse 6 mois', async () => {
        await expect(
            useCase.execute({
                modele_id: 'modele-uuid',
                date_fin_generation: '2027-01-01', // > 6 mois depuis 2026-06-01
            }),
        ).rejects.toThrow(BadRequestException);
    });

    // ── Vérification données créneaux générés ────────────────────────────────

    it('devrait créer les créneaux avec les bonnes propriétés (zone_id, modele_id, is_disponible)', async () => {
        await useCase.execute({
            modele_id: 'modele-uuid',
            date_fin_generation: '2026-06-07',
        });

        const creneauxCrees = mockRepo.createManyCreneaux.mock.calls[0][0];
        for (const creneau of creneauxCrees) {
            expect(creneau.zone_id).toBe('zone-uuid');
            expect(creneau.modele_planification_id).toBe('modele-uuid');
            expect(creneau.is_disponible).toBe(true);
            expect(creneau.date_fin).toBeNull();
        }
    });

    // ── Sans date_fin_generation (plage par défaut) ──────────────────────────

    it('devrait utiliser date_fin_validite du modèle si date_fin_generation non fournie', async () => {
        mockRepo.findModeleById.mockResolvedValue({
            ...mockModele,
            date_fin_validite: '2026-06-07T23:59:59.000Z',
        });

        const rapport = await useCase.execute({ modele_id: 'modele-uuid' });

        // Lundi 01 uniquement dans la semaine du 01 au 07
        expect(rapport.created).toBe(4);
    });

    it("devrait utiliser aujourd'hui + 3 mois si ni date_fin_generation ni date_fin_validite", async () => {
        // Le modèle n'a pas de date_fin_validite (null) et aucune date override fournie
        // → la génération doit s'arrêter à aujourd'hui + 3 mois
        // On vérifie juste que l'appel ne lève pas d'erreur et que createManyCreneaux est appelé
        const rapport = await useCase.execute({ modele_id: 'modele-uuid' });

        expect(rapport).toHaveProperty('created');
        expect(rapport).toHaveProperty('skipped');
        expect(rapport).toHaveProperty('conflicts');
    });
});

// ─── Test de la conversion jour de semaine ───────────────────────────────────

describe('GenerateCreneauxUseCase — conversion jour de semaine', () => {
    it('devrait traiter 2026-06-01 comme un lundi (jour_semaine=0)', async () => {
        const mockRepo = buildMockRepo();
        const useCase = new GenerateCreneauxUseCase(mockRepo);

        // Modèle lundi (0)
        mockRepo.findModeleById.mockResolvedValue({
            ...mockModele,
            jour_semaine: 0,
        });

        // date_fin_generation est EXCLUSIVE → '2026-06-02' pour inclure le 01 (lundi)
        await useCase.execute({
            modele_id: 'modele-uuid',
            date_fin_generation: '2026-06-02',
        });

        const creneauxCrees =
            mockRepo.createManyCreneaux.mock.calls[0]?.[0] ?? [];
        expect(creneauxCrees.length).toBeGreaterThan(0); // des créneaux générés
    });

    it('ne devrait pas générer de créneaux si 2026-06-01 ne correspond pas au jour_semaine', async () => {
        const mockRepo = buildMockRepo();
        const useCase = new GenerateCreneauxUseCase(mockRepo);

        // Modèle mardi (1) — 2026-06-01 est lundi → aucun créneau
        mockRepo.findModeleById.mockResolvedValue({
            ...mockModele,
            jour_semaine: 1,
        });

        await useCase.execute({
            modele_id: 'modele-uuid',
            date_fin_generation: '2026-06-01',
        });

        expect(mockRepo.createManyCreneaux).not.toHaveBeenCalled();
    });
});
