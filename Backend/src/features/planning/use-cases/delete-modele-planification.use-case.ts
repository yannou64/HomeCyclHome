import { NotFoundException } from '@nestjs/common';
import { IPlanningRepository } from '../repositories/planning.repository.interface';

export class DeleteModelePlanificationUseCase {
    constructor(private readonly repo: IPlanningRepository) {}

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
