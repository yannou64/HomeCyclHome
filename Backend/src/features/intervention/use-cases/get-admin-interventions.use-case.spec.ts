import { GetAdminInterventionsUseCase } from './get-admin-interventions.use-case';
import type { IInterventionsRepository } from '../repositories/interventions.repository.interface';
import type { AdminInterventionListItemDto } from '../dto/output/admin-intervention-list-item.dto';

const makeListItem = (
    overrides: Partial<AdminInterventionListItemDto> = {},
): AdminInterventionListItemDto => ({
    id: 'int-1',
    statut: 'Planifiee',
    dateDebut: '2026-06-20T09:00:00.000Z',
    forfaitNom: 'Révision complète',
    zone: { id: 'zone-1', nom: 'Lyon Centre' },
    technicien: { id: 'tech-1', prenom: 'Jean', nom: 'Dupont' },
    ...overrides,
});

describe('GetAdminInterventionsUseCase', () => {
    let useCase: GetAdminInterventionsUseCase;
    let mockRepo: Pick<
        jest.Mocked<IInterventionsRepository>,
        'findAllInterventions'
    >;

    beforeEach(() => {
        mockRepo = { findAllInterventions: jest.fn() };
        useCase = new GetAdminInterventionsUseCase(
            mockRepo as unknown as IInterventionsRepository,
        );
    });

    it('devrait retourner la liste des interventions', async () => {
        const interventions = [makeListItem(), makeListItem({ id: 'int-2' })];
        mockRepo.findAllInterventions.mockResolvedValue(interventions);

        const result = await useCase.execute({ statut: 'Planifiee' });

        expect(result).toHaveLength(2);
        expect(mockRepo.findAllInterventions).toHaveBeenCalledWith({
            statut: 'Planifiee',
        });
    });

    it('devrait retourner un tableau vide si aucune intervention', async () => {
        mockRepo.findAllInterventions.mockResolvedValue([]);

        const result = await useCase.execute({});

        expect(result).toEqual([]);
    });
});
