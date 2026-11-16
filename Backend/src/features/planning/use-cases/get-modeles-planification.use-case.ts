import { Injectable, Inject } from '@nestjs/common';
import { ModelePlanificationResponseDto } from '../dto/output/modele-planification-response.dto';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';

@Injectable()
export class GetModelesPlanificationUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    execute(technicienId: string): Promise<ModelePlanificationResponseDto[]> {
        return this.repo.findModelesByTechnicien(technicienId);
    }
}
