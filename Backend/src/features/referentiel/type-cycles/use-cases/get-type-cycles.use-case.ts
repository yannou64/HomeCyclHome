import { TypeCycleResponseDto } from '../dto/output/type-cycle-response.dto';
import { ITypeCyclesRepository } from '../repositories/type-cycles.repository.interface';

export class GetTypeCyclesUseCase {
    constructor(private readonly repo: ITypeCyclesRepository) {}

    execute(): Promise<TypeCycleResponseDto[]> {
        return this.repo.findAll();
    }
}
