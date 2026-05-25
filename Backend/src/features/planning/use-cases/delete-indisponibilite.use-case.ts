import { Inject, NotFoundException } from '@nestjs/common';
import {
    IPlanningRepository,
    PLANNING_REPO,
} from '../repositories/planning.repository.interface';

export class DeleteIndisponibiliteUseCase {
    constructor(
        @Inject(PLANNING_REPO)
        private readonly repo: IPlanningRepository,
    ) {}

    async execute(id: string): Promise<void> {
        const indispo = await this.repo.findIndisponibiliteById(id);
        if (!indispo) {
            throw new NotFoundException(`Indisponibilité introuvable : ${id}`);
        }
        await this.repo.deleteIndisponibilite(id);
    }
}