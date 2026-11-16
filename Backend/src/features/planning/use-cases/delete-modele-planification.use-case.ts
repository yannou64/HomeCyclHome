import { NotFoundException, Injectable, Inject } from '@nestjs/common';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';

@Injectable()
export class DeleteModelePlanificationUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(id: string): Promise<void> {
        const modele = await this.repo.findModeleById(id);
        if (!modele) {
            throw new NotFoundException(
                `Modèle de planification introuvable : ${id}`,
            );
        }
        await this.repo.deleteModele(id);
    }
}
