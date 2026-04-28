import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ICyclesRepository } from '../repositories/cycles.repository.interface';
import { DeleteCycleUseCase } from './delete-cycle.use-case';

const makeCycle = (override = {}) => ({
    id: 'uuid-1',
    libelle: 'Mon VTT',
    particularite: null,
    dateCreation: new Date(),
    utilisateurId: 'user-1',
    marque: { id: 'marque-1', libelle: 'Trek' },
    typeCycle: { id: 'type-1', libelle: 'VTT' },
    ...override,
});

describe('DeleteCycleUseCase', () => {
    let useCase: DeleteCycleUseCase;
    let mockRepo: jest.Mocked<ICyclesRepository>;

    beforeEach(() => {
        mockRepo = {
            findAllByUser: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        useCase = new DeleteCycleUseCase(mockRepo);
    });

    it("devrait supprimer le cycle si l'utilisateur en est le propriétaire", async () => {
        mockRepo.findById.mockResolvedValue(makeCycle());

        await useCase.execute('uuid-1', 'user-1');

        expect(mockRepo.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('devrait lever NotFoundException si le cycle est introuvable', async () => {
        mockRepo.findById.mockResolvedValue(null);

        await expect(useCase.execute('ghost-id', 'user-1')).rejects.toThrow(NotFoundException);
        expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it('devrait lever ForbiddenException si le cycle appartient à un autre utilisateur', async () => {
        mockRepo.findById.mockResolvedValue(makeCycle({ utilisateurId: 'user-1' }));

        await expect(useCase.execute('uuid-1', 'user-2')).rejects.toThrow(ForbiddenException);
        expect(mockRepo.delete).not.toHaveBeenCalled();
    });
});
