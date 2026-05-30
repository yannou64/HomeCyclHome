import { Inject } from '@nestjs/common';
import { PauseRecurrenteDto } from '../dto/planning.dto';
import {
    IPlanningRepository,
    PLANNING_REPO,
} from '../repositories/planning.repository.interface';

export class GetPausesRecurrentesUseCase {
    constructor(
        @Inject(PLANNING_REPO)
        private readonly repo: IPlanningRepository,
    ) {}

    execute(technicienId: string): Promise<PauseRecurrenteDto[]> {
        return this.repo.findPausesByTechnicien(technicienId);
    }
}
