import { ConflictException, NotFoundException } from '@nestjs/common';
import { IMarquesRepository } from '../repositories/marques.repository.interface';
import { UpdateMarqueUseCase } from './update-marque.use-case';

describe('UpdateMarqueUseCase', () => {
  let useCase: UpdateMarqueUseCase;
  let mockRepo: jest.Mocked<IMarquesRepository>;

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByLibelle: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new UpdateMarqueUseCase(mockRepo);
  });

  it('devrait mettre à jour une marque existante', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'uuid-1', libelle: 'Trek' });
    mockRepo.findByLibelle.mockResolvedValue(null);
    mockRepo.update.mockResolvedValue({ id: 'uuid-1', libelle: 'Trek Pro' });

    const result = await useCase.execute('uuid-1', 'Trek Pro');

    expect(mockRepo.update).toHaveBeenCalledWith('uuid-1', 'Trek Pro');
    expect(result.libelle).toBe('Trek Pro');
  });

  it('devrait lever NotFoundException si la marque est introuvable', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('ghost-id', 'Trek Pro')).rejects.toThrow(NotFoundException);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('devrait lever ConflictException si le nouveau libellé est pris par une autre marque', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'uuid-1', libelle: 'Trek' });
    mockRepo.findByLibelle.mockResolvedValue({ id: 'uuid-2', libelle: 'Decathlon' });

    await expect(useCase.execute('uuid-1', 'Decathlon')).rejects.toThrow(ConflictException);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('devrait autoriser la mise à jour avec le même libellé (pas de conflit avec soi-même)', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'uuid-1', libelle: 'Trek' });
    mockRepo.findByLibelle.mockResolvedValue({ id: 'uuid-1', libelle: 'Trek' });
    mockRepo.update.mockResolvedValue({ id: 'uuid-1', libelle: 'Trek' });

    await expect(useCase.execute('uuid-1', 'Trek')).resolves.not.toThrow();
    expect(mockRepo.update).toHaveBeenCalled();
  });
});
