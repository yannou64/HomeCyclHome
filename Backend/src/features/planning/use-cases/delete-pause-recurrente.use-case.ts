import { NotFoundException } from '@nestjs/common';
import { IPlanningRepository } from '../repositories/planning.repository.interface';

export class DeletePauseRecurrenteUseCase {
    constructor(private readonly repo: IPlanningRepository) {}

    async execute(id: string): Promise<void> {
        const pause = await this.repo.findPauseById(id);
        if (!pause) {
            throw new NotFoundException(`Pause récurrente introuvable : ${id}`);
        }
        await this.repo.deletePause(id);
    }
}
