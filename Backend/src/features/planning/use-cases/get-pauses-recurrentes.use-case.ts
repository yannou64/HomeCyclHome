import { PauseRecurrenteDto } from '../dto/planning.dto';
import { IPlanningRepository } from '../repositories/planning.repository.interface';

export class GetPausesRecurrentesUseCase {
    constructor(private readonly repo: IPlanningRepository) {}

    execute(technicienId: string): Promise<PauseRecurrenteDto[]> {
        return this.repo.findPausesByTechnicien(technicienId);
    }
}
