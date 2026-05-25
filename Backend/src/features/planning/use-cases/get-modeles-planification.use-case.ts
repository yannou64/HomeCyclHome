import { Inject } from '@nestjs/common';
import { ModelePlanificationDto } from '../dto/planning.dto';
import {
    IPlanningRepository,
    PLANNING_REPO,
} from '../repositories/planning.repository.interface';

export class GetModelesPlanificationUseCase {
    constructor(
        @Inject(PLANNING_REPO)
        private readonly repo: IPlanningRepository,
    ) {}

    execute(technicienId: string): Promise<ModelePlanificationDto[]> {
        return this.repo.findModelesByTechnicien(technicienId);
    }
}