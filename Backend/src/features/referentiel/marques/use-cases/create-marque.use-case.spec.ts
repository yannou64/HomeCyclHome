import { ConflictException } from '@nestjs/common';
import { IMarquesRepository } from '../repositories/marques.repository.interface';
import { CreateMarqueUseCase } from './create-marque.use-case';

describe('CreateMarqueUseCase', () => {
  let useCase: CreateMarqueUseCase;
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
    useCase = new CreateMarqueUseCase(mockRepo);
  });

  it('devrait créer une marque si le libellé est disponible', async () => {
    mockRepo.findByLibelle.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue({ id: 'uuid-1', libelle: 'Trek' });

    const result = await useCase.execute('Trek');

    expect(mockRepo.findByLibelle).toHaveBeenCalledWith('Trek');
    expect(mockRepo.create).toHaveBeenCalledWith('Trek');
    expect(result.libelle).toBe('Trek');
  });

  it('devrait lever ConflictException si le libellé existe déjà', async () => {
    mockRepo.findByLibelle.mockResolvedValue({ id: 'uuid-1', libelle: 'Trek' });

    await expect(useCase.execute('Trek')).rejects.toThrow(ConflictException);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
