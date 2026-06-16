import {
    ForbiddenException,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { CancelInterventionUseCase } from './cancel-intervention.use-case';
import type { IInterventionsRepository } from '../repositories/interventions.repository.interface';
import type { InterventionForCancel } from '../repositories/interventions.repository.interface';

const makeInterventionForCancel = (
    overrides: Partial<InterventionForCancel> = {},
): InterventionForCancel => ({
    clientId: 'client-1',
    statut: 'Planifiee',
    creneauId: 'creneau-1',
    ...overrides,
});

describe('CancelInterventionUseCase', () => {
    let useCase: CancelInterventionUseCase;
    let mockRepo: jest.Mocked<
        Pick<
            IInterventionsRepository,
            'findInterventionForCancel' | 'cancelInterventionTransaction'
        >
    >;

    beforeEach(() => {
        mockRepo = {
            findInterventionForCancel: jest.fn(),
            cancelInterventionTransaction: jest.fn(),
        };
        useCase = new CancelInterventionUseCase(
            mockRepo as unknown as IInterventionsRepository,
        );
    });

    it("annule l'intervention et libère le créneau", async () => {
        mockRepo.findInterventionForCancel.mockResolvedValue(
            makeInterventionForCancel(),
        );
        mockRepo.cancelInterventionTransaction.mockResolvedValue(undefined);

        await useCase.execute('int-1', 'client-1');

        expect(mockRepo.cancelInterventionTransaction).toHaveBeenCalledWith(
            'int-1',
            'creneau-1',
        );
    });

    it("lève NotFoundException si l'intervention n'existe pas", async () => {
        mockRepo.findInterventionForCancel.mockResolvedValue(null);

        await expect(
            useCase.execute('int-inexistant', 'client-1'),
        ).rejects.toThrow(NotFoundException);
        expect(mockRepo.cancelInterventionTransaction).not.toHaveBeenCalled();
    });

    it("lève ForbiddenException si l'intervention appartient à un autre client", async () => {
        mockRepo.findInterventionForCancel.mockResolvedValue(
            makeInterventionForCancel({ clientId: 'client-autre' }),
        );

        await expect(useCase.execute('int-1', 'client-1')).rejects.toThrow(
            ForbiddenException,
        );
        expect(mockRepo.cancelInterventionTransaction).not.toHaveBeenCalled();
    });

    it('lève ConflictException si le statut est Terminee', async () => {
        mockRepo.findInterventionForCancel.mockResolvedValue(
            makeInterventionForCancel({ statut: 'Terminee' }),
        );

        await expect(useCase.execute('int-1', 'client-1')).rejects.toThrow(
            ConflictException,
        );
        expect(mockRepo.cancelInterventionTransaction).not.toHaveBeenCalled();
    });

    it('lève ConflictException si le statut est déjà Annulee', async () => {
        mockRepo.findInterventionForCancel.mockResolvedValue(
            makeInterventionForCancel({ statut: 'Annulee' }),
        );

        await expect(useCase.execute('int-1', 'client-1')).rejects.toThrow(
            ConflictException,
        );
        expect(mockRepo.cancelInterventionTransaction).not.toHaveBeenCalled();
    });
});
