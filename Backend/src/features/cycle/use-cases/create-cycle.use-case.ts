import { CreateCycleInput } from '../dto/input/create-cycle.dto';
import { CycleResponseDto } from '../dto/output/cycle-response.dto';
import { ICyclesRepository } from '../repositories/cycles.repository.interface';

export class CreateCycleUseCase {
    constructor(private readonly repo: ICyclesRepository) {}

    execute(
        utilisateurId: string,
        data: CreateCycleInput,
    ): Promise<CycleResponseDto> {
        return this.repo.create(utilisateurId, data);
    }
}
