import { PauseRecurrenteResponseDto } from '../dto/output/pause-recurrente-response.dto';
import { IPlanningRepository } from '../repositories/planning.repository.interface';

export class GetPausesRecurrentesUseCase {
    constructor(private readonly repo: IPlanningRepository) {}

    execute(technicienId: string): Promise<PauseRecurrenteResponseDto[]> {
        return this.repo.findPausesByTechnicien(technicienId);
    }
}
