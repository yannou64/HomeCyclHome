import { ITypeCyclesRepository } from '../repositories/type-cycles.repository.interface';
import { GetTypeCyclesUseCase } from './get-type-cycles.use-case';

describe('GetTypeCyclesUseCase', () => {
  let useCase: GetTypeCyclesUseCase;
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
    useCase = new GetTypeCyclesUseCase(mockRepo);
  });

  it('devrait retourner tous les types de cycles', async () => {
    const types = [
      { id: 'uuid-1', libelle: 'VTT' },
      { id: 'uuid-2', libelle: 'Vélo de route' },
    ];
    mockRepo.findAll.mockResolvedValue(types);

    const result = await useCase.execute();

    expect(result).toEqual(types);
    expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
  });

  it('devrait retourner un tableau vide si aucun type de cycle', async () => {
    mockRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
