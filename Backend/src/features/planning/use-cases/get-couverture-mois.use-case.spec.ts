import type { IPlanningRepository } from '../repositories/planning.repository.interface';
import { GetCouvertureMoisUseCase } from './get-couverture-mois.use-case';

// La date du jour dépend de l'horloge : on la fige avec les faux minuteurs de
// Jest, qui remplacent aussi `new Date()`. Les autres critères de l'US se
// testent en intégration : test/couverture-calendrier.e2e-spec.ts.
describe('US-01 Consulter le calendrier de couverture et choisir une date 2.0', () => {
    let repo: jest.Mocked<IPlanningRepository>;
    let useCase: GetCouvertureMoisUseCase;

    beforeEach(() => {
        repo = {
            technicienExiste: jest.fn().mockResolvedValue(true),
            trouverZonesProposees: jest.fn().mockResolvedValue([]),
            zoneAffecteeEtActive: jest.fn().mockResolvedValue(true),
            intituleExiste: jest.fn().mockResolvedValue(false),
            trouverModeles: jest.fn().mockResolvedValue([]),
            creerModele: jest.fn().mockResolvedValue({ id: 'modele-1' }),
            trouverModele: jest.fn().mockResolvedValue(null),
            supprimerModele: jest.fn().mockResolvedValue(true),
            trouverCreneauxEntre: jest.fn().mockResolvedValue([]),
            trouverTechnicien: jest.fn().mockResolvedValue(null),
            trouverInterventionsDuJour: jest.fn().mockResolvedValue([]),
            trouverTechniciens: jest.fn().mockResolvedValue([]),
            trouverZones: jest.fn().mockResolvedValue([]),
            derniersCreneaux: jest.fn().mockResolvedValue({
                parTechnicien: new Map(),
                parZone: new Map(),
            }),
            compterPeriode: jest
                .fn()
                .mockResolvedValue({ creneaux: 0, interventions: 0 }),
            remplacerCreneaux: jest.fn().mockResolvedValue(null),
            modifierModele: jest.fn().mockResolvedValue(null),
        };
        useCase = new GetCouvertureMoisUseCase(repo);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('CA03 — détermine la date du jour dans le fuseau d’exploitation, pas en UTC [RG4]', async () => {
        // 30/11/2026 à 23h30 UTC = 1er/12/2026 à 0h30 à Paris (UTC+1 en hiver).
        // En UTC, on serait encore en novembre.
        jest.useFakeTimers({ now: new Date('2026-11-30T23:30:00.000Z') });

        const couverture = await useCase.execute();

        expect(couverture.aujourdHui).toBe('2026-12-01');
        expect(couverture.mois).toBe('2026-12');
        // Le mois lu en base est décembre à Paris : du 1er/12 0h00 (heure de
        // Paris, soit 30/11 23h00 UTC) au 1er/01 0h00 (31/12 23h00 UTC)
        expect(repo.trouverCreneauxEntre).toHaveBeenCalledWith(
            new Date('2026-11-30T23:00:00.000Z'),
            new Date('2026-12-31T23:00:00.000Z'),
        );
    });
});
