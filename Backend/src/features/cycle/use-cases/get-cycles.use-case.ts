import { CycleDto } from '../dto/output/cycle.dto';
import { ICyclesRepository } from '../repositories/cycles.repository.interface';

export class GetCyclesUseCase {
    constructor(private readonly repo: ICyclesRepository) {}

    execute(utilisateurId: string): Promise<CycleDto[]> {
        return this.repo.findAllByUser(utilisateurId);
    }
}
