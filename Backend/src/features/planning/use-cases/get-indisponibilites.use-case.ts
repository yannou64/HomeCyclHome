import { Injectable, Inject } from '@nestjs/common';
import { IndisponibiliteResponseDto } from '../dto/output/indisponibilite-response.dto';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';

@Injectable()
export class GetIndisponibilitesUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    execute(technicienId: string): Promise<IndisponibiliteResponseDto[]> {
        return this.repo.findIndisponibilitesByTechnicien(technicienId);
    }
}
