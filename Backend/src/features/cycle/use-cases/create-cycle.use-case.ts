import { CreateCycleInput } from '../dto/input/cycle-input.dto';
import { CycleDto } from '../dto/output/cycle.dto';
import { ICyclesRepository } from '../repositories/cycles.repository.interface';

export class CreateCycleUseCase {
    constructor(private readonly repo: ICyclesRepository) {}

    execute(utilisateurId: string, data: CreateCycleInput): Promise<CycleDto> {
        return this.repo.create(utilisateurId, data);
    }
}
