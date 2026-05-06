import { NotFoundException } from '@nestjs/common';
import { IForfaitsRepository } from '../repositories/forfaits.repository.interface';
import { DeleteForfaitUseCase } from './delete-forfait.use-case';

describe('DeleteForfaitUseCase', () => {
    let useCase: DeleteForfaitUseCase;
    let mockRepo: jest.Mocked<IForfaitsRepository>;

    beforeEach(() => {
        mockRepo = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByNom: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            setPrix: jest.fn(),
        };
        useCase = new DeleteForfaitUseCase(mockRepo);
    });

    it('devrait supprimer un forfait existant', async () => {
        mockRepo.findById.mockResolvedValue({
            id: 'uuid-1',
            nom: 'Révision Express',
            description: null,
            duree_minutes: 45,
            is_actif: true,
            prix_actif: null,
        });

        await useCase.execute('uuid-1');

        expect(mockRepo.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('devrait lever NotFoundException si le forfait est introuvable', async () => {
        mockRepo.findById.mockResolvedValue(null);

        await expect(useCase.execute('ghost-uuid')).rejects.toThrow(
            NotFoundException,
        );
        expect(mockRepo.delete).not.toHaveBeenCalled();
    });
});
