import { Injectable, Inject } from '@nestjs/common';
import { PauseRecurrenteResponseDto } from '../dto/output/pause-recurrente-response.dto';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';

@Injectable()
export class GetPausesRecurrentesUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    execute(technicienId: string): Promise<PauseRecurrenteResponseDto[]> {
        return this.repo.findPausesByTechnicien(technicienId);
    }
}
