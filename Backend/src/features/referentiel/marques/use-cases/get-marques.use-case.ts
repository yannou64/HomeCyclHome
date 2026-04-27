import { MarqueDto } from '../dto/marque.dto';
import { IMarquesRepository } from '../repositories/marques.repository.interface';

export class GetMarquesUseCase {
  constructor(private readonly repo: IMarquesRepository) {}

  execute(): Promise<MarqueDto[]> {
    return this.repo.findAll();
  }
}
