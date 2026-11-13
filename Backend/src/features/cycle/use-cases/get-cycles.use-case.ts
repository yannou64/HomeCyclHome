import { CycleResponseDto } from '../dto/output/cycle-response.dto';
import { ICyclesRepository } from '../repositories/cycles.repository.interface';

export class GetCyclesUseCase {
    constructor(private readonly repo: ICyclesRepository) {}

    execute(utilisateurId: string): Promise<CycleResponseDto[]> {
        return this.repo.findAllByUser(utilisateurId);
    }
}
