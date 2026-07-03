import { GetAdminInterventionsUseCase } from './get-admin-interventions.use-case';
import type { IInterventionsRepository } from '../repositories/interventions.repository.interface';
import type { AdminInterventionListItemDto } from '../dto/output/admin-intervention-list-item.dto';

const makeListItem = (
    overrides: Partial<AdminInterventionListItemDto> = {},
): AdminInterventionListItemDto => ({
    id: 'int-1',
    statut: 'Planifiee',
    enRetard: false,
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

    it('devrait retourner data + meta paginés', async () => {
        const interventions = [makeListItem(), makeListItem({ id: 'int-2' })];
        mockRepo.findAllInterventions.mockResolvedValue({
            interventions,
            total: 25,
        });

        const result = await useCase.execute({
            statut: 'Planifiee',
            page: 2,
            limit: 10,
        });

        expect(result.data).toHaveLength(2);
        expect(result.meta).toEqual({
            total: 25,
            page: 2,
            limit: 10,
            totalPages: 3,
        });
        expect(mockRepo.findAllInterventions).toHaveBeenCalledWith({
            statut: 'Planifiee',
            page: 2,
            limit: 10,
        });
    });

    it('devrait calculer totalPages à 1 quand total est inférieur à limit', async () => {
        mockRepo.findAllInterventions.mockResolvedValue({
            interventions: [makeListItem()],
            total: 3,
        });

        const result = await useCase.execute({ page: 1, limit: 10 });

        expect(result.meta.totalPages).toBe(1);
    });

    it('devrait retourner data vide et totalPages à 0 si aucune intervention', async () => {
        mockRepo.findAllInterventions.mockResolvedValue({
            interventions: [],
            total: 0,
        });

        const result = await useCase.execute({ page: 1, limit: 10 });

        expect(result.data).toEqual([]);
        expect(result.meta.totalPages).toBe(0);
    });

    it('devrait transmettre le filtre statut enRetard tel quel au repository', async () => {
        mockRepo.findAllInterventions.mockResolvedValue({
            interventions: [makeListItem({ enRetard: true })],
            total: 1,
        });

        await useCase.execute({ statut: 'enRetard', page: 1, limit: 10 });

        expect(mockRepo.findAllInterventions).toHaveBeenCalledWith({
            statut: 'enRetard',
            page: 1,
            limit: 10,
        });
    });
});
