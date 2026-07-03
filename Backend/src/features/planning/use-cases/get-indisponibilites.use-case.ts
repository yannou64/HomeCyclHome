import { Inject } from '@nestjs/common';
import { IndisponibiliteDto } from '../dto/planning.dto';
import {
    IPlanningRepository,
    PLANNING_REPO,
} from '../repositories/planning.repository.interface';

export class GetIndisponibilitesUseCase {
    constructor(
        @Inject(PLANNING_REPO)
        private readonly repo: IPlanningRepository,
    ) {}

    execute(technicienId: string): Promise<IndisponibiliteDto[]> {
        return this.repo.findIndisponibilitesByTechnicien(technicienId);
    }
}
