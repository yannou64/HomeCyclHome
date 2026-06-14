import { GetClientInterventionsUseCase } from './get-client-interventions.use-case';
import type { IInterventionsRepository } from '../repositories/interventions.repository.interface';
import type { InterventionListItemDto } from '../dto/output/intervention-list-item.dto';

const makeIntervention = (
    overrides: Partial<InterventionListItemDto> = {},
): InterventionListItemDto => ({
    id: 'int-1',
    statut: 'Planifiee',
    dateCreation: '2026-06-10T10:00:00.000Z',
    dateDebut: '2026-06-20T09:00:00.000Z',
    dateFin: null,
    forfaitNom: 'Révision complète',
    dureeMinutesSnapshot: 60,
    adresse: {
        numero: '12',
        rue: 'Rue de la Paix',
        codePostal: '75001',
        ville: 'Paris',
    },
    cycle: { libelle: 'Mon vélo', marque: 'Trek', type: 'VTT' },
    commentaire: null,
    ...overrides,
});

describe('GetClientInterventionsUseCase', () => {
    let useCase: GetClientInterventionsUseCase;
    let mockRepo: jest.Mocked<
        Pick<IInterventionsRepository, 'getInterventionsByClientId'>
    >;

    beforeEach(() => {
        mockRepo = { getInterventionsByClientId: jest.fn() };
        useCase = new GetClientInterventionsUseCase(
            mockRepo as unknown as IInterventionsRepository,
        );
    });

    it('retourne la liste des interventions du client', async () => {
        const interventions = [
            makeIntervention(),
            makeIntervention({ id: 'int-2', statut: 'Terminee' }),
        ];
        mockRepo.getInterventionsByClientId.mockResolvedValue(interventions);

        const result = await useCase.execute('client-1');

        expect(result).toEqual(interventions);
        expect(mockRepo.getInterventionsByClientId).toHaveBeenCalledWith(
            'client-1',
        );
    });

    it("retourne un tableau vide si le client n'a aucune intervention", async () => {
        mockRepo.getInterventionsByClientId.mockResolvedValue([]);

        const result = await useCase.execute('client-1');

        expect(result).toEqual([]);
    });
});
