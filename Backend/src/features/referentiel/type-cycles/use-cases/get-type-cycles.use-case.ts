import { TypeCycleDto } from '../dto/type-cycle.dto';
import { ITypeCyclesRepository } from '../repositories/type-cycles.repository.interface';

export class GetTypeCyclesUseCase {
  constructor(private readonly repo: ITypeCyclesRepository) {}

  execute(): Promise<TypeCycleDto[]> {
    return this.repo.findAll();
  }
}
