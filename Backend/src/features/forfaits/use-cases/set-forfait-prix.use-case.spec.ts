import { NotFoundException } from '@nestjs/common';
import { IForfaitsRepository } from '../repositories/forfaits.repository.interface';
import { SetForfaitPrixUseCase } from './set-forfait-prix.use-case';

const existingForfait = {
    id: 'uuid-1',
    nom: 'Révision Express',
    description: null,
    dureeMinutes: 45,
    isActif: true,
    prixActif: null,
};

describe('SetForfaitPrixUseCase', () => {
    let useCase: SetForfaitPrixUseCase;
    let mockRepo: jest.Mocked<IForfaitsRepository>;

    beforeEach(() => {
        mockRepo = {
            findAll: jest.fn(),
            findAllActifs: jest.fn(),
            findById: jest.fn(),
            findByNom: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            setPrix: jest.fn(),
        };
        useCase = new SetForfaitPrixUseCase(mockRepo);
    });

    it('devrait définir le prix si le forfait existe', async () => {
        const dateDebut = new Date('2026-05-05');
        mockRepo.findById.mockResolvedValue(existingForfait);
        mockRepo.setPrix.mockResolvedValue(undefined);

        await useCase.execute('uuid-1', 49.9, dateDebut);

        expect(mockRepo.findById).toHaveBeenCalledWith('uuid-1');
        expect(mockRepo.setPrix).toHaveBeenCalledWith(
            'uuid-1',
            49.9,
            dateDebut,
        );
    });

    it('devrait lever NotFoundException si le forfait est introuvable', async () => {
        mockRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute('ghost-uuid', 49.9, new Date()),
        ).rejects.toThrow(NotFoundException);
        expect(mockRepo.setPrix).not.toHaveBeenCalled();
    });
});
