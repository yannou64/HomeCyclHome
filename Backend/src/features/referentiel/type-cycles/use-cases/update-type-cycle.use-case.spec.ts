import { ConflictException, NotFoundException } from '@nestjs/common';
import { ITypeCyclesRepository } from '../repositories/type-cycles.repository.interface';
import { UpdateTypeCycleUseCase } from './update-type-cycle.use-case';

describe('UpdateTypeCycleUseCase', () => {
    let useCase: UpdateTypeCycleUseCase;
    let mockRepo: jest.Mocked<ITypeCyclesRepository>;

    beforeEach(() => {
        mockRepo = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByLibelle: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        useCase = new UpdateTypeCycleUseCase(mockRepo);
    });

    it('devrait mettre à jour un type de cycle existant', async () => {
        mockRepo.findById.mockResolvedValue({ id: 'uuid-1', libelle: 'VTT' });
        mockRepo.findByLibelle.mockResolvedValue(null);
        mockRepo.update.mockResolvedValue({
            id: 'uuid-1',
            libelle: 'VTT Électrique',
        });

        const result = await useCase.execute('uuid-1', 'VTT Électrique');

        expect(mockRepo.update).toHaveBeenCalledWith(
            'uuid-1',
            'VTT Électrique',
        );
        expect(result.libelle).toBe('VTT Électrique');
    });

    it('devrait lever NotFoundException si le type de cycle est introuvable', async () => {
        mockRepo.findById.mockResolvedValue(null);

        await expect(useCase.execute('ghost-id', 'VTT')).rejects.toThrow(
            NotFoundException,
        );
        expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('devrait lever ConflictException si le nouveau libellé est pris par un autre type', async () => {
        mockRepo.findById.mockResolvedValue({ id: 'uuid-1', libelle: 'VTT' });
        mockRepo.findByLibelle.mockResolvedValue({
            id: 'uuid-2',
            libelle: 'Cargo',
        });

        await expect(useCase.execute('uuid-1', 'Cargo')).rejects.toThrow(
            ConflictException,
        );
        expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('devrait autoriser la mise à jour avec le même libellé (pas de conflit avec soi-même)', async () => {
        mockRepo.findById.mockResolvedValue({ id: 'uuid-1', libelle: 'VTT' });
        mockRepo.findByLibelle.mockResolvedValue({
            id: 'uuid-1',
            libelle: 'VTT',
        });
        mockRepo.update.mockResolvedValue({ id: 'uuid-1', libelle: 'VTT' });

        await expect(useCase.execute('uuid-1', 'VTT')).resolves.not.toThrow();
        expect(mockRepo.update).toHaveBeenCalled();
    });
});
