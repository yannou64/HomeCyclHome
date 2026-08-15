import { ModelePlanificationDto } from '../dto/planning.dto';
import { IPlanningRepository } from '../repositories/planning.repository.interface';

export class GetModelesPlanificationUseCase {
    constructor(private readonly repo: IPlanningRepository) {}

    execute(technicienId: string): Promise<ModelePlanificationDto[]> {
        return this.repo.findModelesByTechnicien(technicienId);
    }
}
