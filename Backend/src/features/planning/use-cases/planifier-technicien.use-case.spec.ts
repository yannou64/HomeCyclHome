import type { PlanifierTechnicienDto } from '../dto/input/planifier-technicien.dto';
import type { IPlanningRepository } from '../repositories/planning.repository.interface';
import { PlanifierTechnicienUseCase } from './planifier-technicien.use-case';

// Calcul des créneaux à créer : quels jours, quels horaires, dans le fuseau
// d'exploitation. La transaction (suppression, conflits, création) est testée
// en intégration : test/generer-creneaux.e2e-spec.ts.
describe('US-03 Générer les créneaux et réinitialiser la période 2.0', () => {
    let repo: Pick<
        jest.Mocked<IPlanningRepository>,
        | 'technicienExiste'
        | 'zoneAffecteeEtActive'
        | 'compterPeriode'
        | 'remplacerCreneaux'
    >;
    let useCase: PlanifierTechnicienUseCase;

    beforeEach(() => {
        // Horloge figée le 23/11/2026 : toutes les périodes ci-dessous sont
        // après demain
        jest.useFakeTimers({ now: new Date('2026-11-23T09:00:00.000Z') });
        repo = {
            technicienExiste: jest.fn().mockResolvedValue(true),
            zoneAffecteeEtActive: jest.fn().mockResolvedValue(true),
            compterPeriode: jest
                .fn()
                .mockResolvedValue({ creneaux: 0, interventions: 0 }),
            remplacerCreneaux: jest.fn().mockResolvedValue({
                creneauxSupprimes: 0,
                interventionsEnConflit: 0,
            }),
        };
        useCase = new PlanifierTechnicienUseCase(
            repo as unknown as IPlanningRepository,
        );
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    /** Ce que la génération a demandé au repository d'écrire. */
    function remplacement() {
        return repo.remplacerCreneaux.mock.calls[0][0];
    }

    it('CA09 — ne crée des créneaux que les jours de semaine choisis [RG7]', async () => {
        // Du vendredi 26/03/2027 au mardi 30/03/2027 ; passage à l'heure
        // d'été le dimanche 28/03. Choisis : vendredi et lundi, 8h00–9h00.
        const saisie: PlanifierTechnicienDto = {
            zoneId: 'zone-1',
            jours: ['vendredi', 'lundi'],
            blocs: [{ debut: 480, fin: 540 }],
            dateDebut: '2027-03-26',
            dateFin: '2027-03-30',
        };

        await useCase.execute('technicien-1', saisie);

        const r = remplacement();
        // 8h00 et 8h30 à l'horloge de Paris : UTC+1 le vendredi, UTC+2 le
        // lundi. Ni samedi, ni dimanche, ni mardi.
        expect(r.nouveaux).toEqual([
            new Date('2027-03-26T07:00:00.000Z'),
            new Date('2027-03-26T07:30:00.000Z'),
            new Date('2027-03-29T06:00:00.000Z'),
            new Date('2027-03-29T06:30:00.000Z'),
        ]);
        // La période remplacée : du 26/03 à 0h00 au 31/03 à 0h00, heure de
        // Paris, tous les jours compris (RG9)
        expect(r.debut).toEqual(new Date('2027-03-25T23:00:00.000Z'));
        expect(r.fin).toEqual(new Date('2027-03-30T22:00:00.000Z'));
        expect(r).toMatchObject({
            technicienId: 'technicien-1',
            zoneId: 'zone-1',
        });
    });

    it('CA19 — accepte une période d’un an : aucun plafond [RG13]', async () => {
        // Du 01/12/2026 au 30/11/2027 : 365 jours, tous choisis, 8h00–9h00
        const saisie: PlanifierTechnicienDto = {
            zoneId: 'zone-1',
            jours: [
                'lundi',
                'mardi',
                'mercredi',
                'jeudi',
                'vendredi',
                'samedi',
                'dimanche',
            ],
            blocs: [{ debut: 480, fin: 540 }],
            dateDebut: '2026-12-01',
            dateFin: '2027-11-30',
        };

        const resultat = await useCase.execute('technicien-1', saisie);

        // 365 jours × 2 créneaux
        expect(remplacement().nouveaux).toHaveLength(730);
        expect(resultat.creneauxCrees).toBe(730);
    });
});
