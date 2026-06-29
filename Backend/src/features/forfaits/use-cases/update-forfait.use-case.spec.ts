import { ConflictException, NotFoundException } from '@nestjs/common';
import { IForfaitsRepository } from '../repositories/forfaits.repository.interface';
import { UpdateForfaitUseCase } from './update-forfait.use-case';

const existingForfait = {
    id: 'uuid-1',
    nom: 'Révision Express',
    description: null,
    dureeMinutes: 45,
    isActif: true,
    prixActif: null,
};

describe('UpdateForfaitUseCase', () => {
    let useCase: UpdateForfaitUseCase;
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
        useCase = new UpdateForfaitUseCase(mockRepo);
    });

    it('devrait mettre à jour un forfait existant', async () => {
        mockRepo.findById.mockResolvedValue(existingForfait);
        mockRepo.update.mockResolvedValue({
            ...existingForfait,
            dureeMinutes: 60,
        });

        const result = await useCase.execute('uuid-1', { dureeMinutes: 60 });

        expect(mockRepo.update).toHaveBeenCalledWith('uuid-1', {
            dureeMinutes: 60,
        });
        expect(result.dureeMinutes).toBe(60);
    });

    it('devrait lever NotFoundException si le forfait est introuvable', async () => {
        mockRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute('ghost-uuid', { dureeMinutes: 60 }),
        ).rejects.toThrow(NotFoundException);
        expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('devrait lever ConflictException si le nouveau nom est déjà pris par un autre forfait', async () => {
        mockRepo.findById.mockResolvedValue(existingForfait);
        mockRepo.findByNom.mockResolvedValue({
            id: 'uuid-2', // autre forfait
            nom: 'Révision Standard',
            description: null,
            dureeMinutes: 90,
            isActif: true,
            prixActif: null,
        });

        await expect(
            useCase.execute('uuid-1', { nom: 'Révision Standard' }),
        ).rejects.toThrow(ConflictException);
        expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it("devrait autoriser la mise à jour du nom si c'est le même forfait", async () => {
        mockRepo.findById.mockResolvedValue(existingForfait);
        // findByNom retourne le même forfait (même id) → pas de conflit
        mockRepo.findByNom.mockResolvedValue(existingForfait);
        mockRepo.update.mockResolvedValue({
            ...existingForfait,
            nom: 'Révision Express',
        });

        await useCase.execute('uuid-1', { nom: 'Révision Express' });

        expect(mockRepo.update).toHaveBeenCalled();
    });
});
