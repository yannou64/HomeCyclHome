import { NotFoundException } from '@nestjs/common';
import { IMarquesRepository } from '../repositories/marques.repository.interface';
import { DeleteMarqueUseCase } from './delete-marque.use-case';

describe('DeleteMarqueUseCase', () => {
  let useCase: DeleteMarqueUseCase;
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
    useCase = new DeleteMarqueUseCase(mockRepo);
  });

  it('devrait supprimer une marque existante', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'uuid-1', libelle: 'Trek' });

    await useCase.execute('uuid-1');

    expect(mockRepo.delete).toHaveBeenCalledWith('uuid-1');
  });

  it('devrait lever NotFoundException si la marque est introuvable', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('ghost-id')).rejects.toThrow(NotFoundException);
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });
});
