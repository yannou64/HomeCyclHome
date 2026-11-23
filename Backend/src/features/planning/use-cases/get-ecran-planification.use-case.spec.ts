import type { IPlanningRepository } from '../repositories/planning.repository.interface';
import { GetEcranPlanificationUseCase } from './get-ecran-planification.use-case';

// « Demain » dépend de l'horloge : on la fige avec les faux minuteurs de Jest,
// qui remplacent aussi `new Date()`. L'API le calcule et la page préremplit la
// date de début avec (écart du 23/11/2026). Les autres critères de l'US sont
// testés en intégration : test/definir-planification.e2e-spec.ts.
describe('US-02 Définir les blocs, la zone, les jours et la période 2.0', () => {
    let repo: Pick<
        jest.Mocked<IPlanningRepository>,
        'technicienExiste' | 'trouverZonesProposees'
    >;
    let useCase: GetEcranPlanificationUseCase;

    beforeEach(() => {
        // Seules les deux méthodes lues par ce use case sont simulées
        repo = {
            technicienExiste: jest.fn().mockResolvedValue(true),
            trouverZonesProposees: jest.fn().mockResolvedValue([]),
        };
        useCase = new GetEcranPlanificationUseCase(
            repo as unknown as IPlanningRepository,
        );
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('CA04 — préremplit la date de début avec demain, dans le fuseau d’exploitation [RG6]', async () => {
        // 30/11/2026 à 23h30 UTC = 1er/12/2026 à 0h30 à Paris (UTC+1) :
        // demain est le 2/12. Calculé en UTC, on aurait le 1er/12.
        jest.useFakeTimers({ now: new Date('2026-11-30T23:30:00.000Z') });

        const ecran = await useCase.execute('technicien-1');

        expect(ecran.demain).toBe('2026-12-02');
    });
});
