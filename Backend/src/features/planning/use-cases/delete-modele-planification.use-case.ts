import { Inject, NotFoundException } from '@nestjs/common';
import {
    IPlanningRepository,
    PLANNING_REPO,
} from '../repositories/planning.repository.interface';

export class DeleteModelePlanificationUseCase {
    constructor(
        @Inject(PLANNING_REPO)
        private readonly repo: IPlanningRepository,
    ) {}

    async execute(id: string): Promise<void> {
        const modele = await this.repo.findModeleById(id);
        if (!modele) {
            throw new NotFoundException(`Modèle de planification introuvable : ${id}`);
        }
        await this.repo.deleteModele(id);
    }
}