import { NotFoundException } from '@nestjs/common';
import { ITypeCyclesRepository } from '../repositories/type-cycles.repository.interface';
import { DeleteTypeCycleUseCase } from './delete-type-cycle.use-case';

describe('DeleteTypeCycleUseCase', () => {
  let useCase: DeleteTypeCycleUseCase;
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
    useCase = new DeleteTypeCycleUseCase(mockRepo);
  });

  it('devrait supprimer un type de cycle existant', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'uuid-1', libelle: 'VTT' });

    await useCase.execute('uuid-1');

    expect(mockRepo.delete).toHaveBeenCalledWith('uuid-1');
  });

  it('devrait lever NotFoundException si le type de cycle est introuvable', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('ghost-id')).rejects.toThrow(NotFoundException);
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });
});
