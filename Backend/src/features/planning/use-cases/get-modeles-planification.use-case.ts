import { ModelePlanificationResponseDto } from '../dto/output/modele-planification-response.dto';
import { IPlanningRepository } from '../repositories/planning.repository.interface';

export class GetModelesPlanificationUseCase {
    constructor(private readonly repo: IPlanningRepository) {}

    execute(technicienId: string): Promise<ModelePlanificationResponseDto[]> {
        return this.repo.findModelesByTechnicien(technicienId);
    }
}
