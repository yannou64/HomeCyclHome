import { NotFoundException } from '@nestjs/common';
import { GetAdminInterventionDetailUseCase } from './get-admin-intervention-detail.use-case';
import type { IInterventionsRepository } from '../repositories/interventions.repository.interface';
import type { AdminInterventionDetailDto } from '../dto/output/admin-intervention-detail.dto';

const makeDetail = (
    overrides: Partial<AdminInterventionDetailDto> = {},
): AdminInterventionDetailDto => ({
    id: 'int-1',
    statut: 'Planifiee',
    dateDebut: '2026-06-20T09:00:00.000Z',
    forfaitNom: 'Révision complète',
    zone: { id: 'zone-1', nom: 'Lyon Centre' },
    technicien: { id: 'tech-1', prenom: 'Jean', nom: 'Dupont' },
    dateCreation: '2026-06-15T10:00:00.000Z',
    dateFin: null,
    dureeMinutesSnapshot: 60,
    commentaire: null,
    client: {
        id: 'client-1',
        prenom: 'Marie',
        nom: 'Martin',
        email: 'marie@example.com',
        telephone: '0612345678',
    },
    adresse: {
        numero: '12',
        rue: 'Rue de la Paix',
        codePostal: '69001',
        ville: 'Lyon',
    },
    cycle: {
        libelle: 'Mon vélo',
        marque: 'Trek',
        type: 'VTT',
    },
    ...overrides,
});

describe('GetAdminInterventionDetailUseCase', () => {
    let useCase: GetAdminInterventionDetailUseCase;
    let mockRepo: Pick<
        jest.Mocked<IInterventionsRepository>,
        'findInterventionDetailById'
    >;

    beforeEach(() => {
        mockRepo = { findInterventionDetailById: jest.fn() };
        useCase = new GetAdminInterventionDetailUseCase(
            mockRepo as unknown as IInterventionsRepository,
        );
    });

    it("devrait retourner le détail de l'intervention", async () => {
        const detail = makeDetail();
        mockRepo.findInterventionDetailById.mockResolvedValue(detail);

        const result = await useCase.execute('int-1');

        expect(result).toEqual(detail);
        expect(mockRepo.findInterventionDetailById).toHaveBeenCalledWith(
            'int-1',
        );
    });

    it("devrait lever NotFoundException si l'intervention n'existe pas", async () => {
        mockRepo.findInterventionDetailById.mockResolvedValue(null);

        await expect(useCase.execute('inexistant')).rejects.toThrow(
            NotFoundException,
        );
    });
});
