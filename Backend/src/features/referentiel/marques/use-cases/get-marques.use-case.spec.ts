import { IMarquesRepository } from '../repositories/marques.repository.interface';
import { GetMarquesUseCase } from './get-marques.use-case';

const makeMarque = (override = {}) => ({
  id: 'uuid-1',
  libelle: 'Trek',
  ...override,
});

describe('GetMarquesUseCase', () => {
  let useCase: GetMarquesUseCase;
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
    useCase = new GetMarquesUseCase(mockRepo);
  });

  it('devrait retourner toutes les marques', async () => {
    const marques = [makeMarque(), makeMarque({ id: 'uuid-2', libelle: 'Decathlon' })];
    mockRepo.findAll.mockResolvedValue(marques);

    const result = await useCase.execute();

    expect(result).toEqual(marques);
    expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
  });

  it('devrait retourner un tableau vide si aucune marque', async () => {
    mockRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
