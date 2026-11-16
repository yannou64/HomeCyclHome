import { NotFoundException, Injectable, Inject } from '@nestjs/common';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';

@Injectable()
export class DeletePauseRecurrenteUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(id: string): Promise<void> {
        const pause = await this.repo.findPauseById(id);
        if (!pause) {
            throw new NotFoundException(`Pause récurrente introuvable : ${id}`);
        }
        await this.repo.deletePause(id);
    }
}
