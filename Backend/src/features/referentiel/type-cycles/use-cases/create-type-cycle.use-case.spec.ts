import { ConflictException } from '@nestjs/common';
import { ITypeCyclesRepository } from '../repositories/type-cycles.repository.interface';
import { CreateTypeCycleUseCase } from './create-type-cycle.use-case';

describe('CreateTypeCycleUseCase', () => {
  let useCase: CreateTypeCycleUseCase;
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
    useCase = new CreateTypeCycleUseCase(mockRepo);
  });

  it('devrait créer un type de cycle si le libellé est disponible', async () => {
    mockRepo.findByLibelle.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue({ id: 'uuid-1', libelle: 'VTT' });

    const result = await useCase.execute('VTT');

    expect(mockRepo.findByLibelle).toHaveBeenCalledWith('VTT');
    expect(mockRepo.create).toHaveBeenCalledWith('VTT');
    expect(result.libelle).toBe('VTT');
  });

  it('devrait lever ConflictException si le libellé existe déjà', async () => {
    mockRepo.findByLibelle.mockResolvedValue({ id: 'uuid-1', libelle: 'VTT' });

    await expect(useCase.execute('VTT')).rejects.toThrow(ConflictException);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
