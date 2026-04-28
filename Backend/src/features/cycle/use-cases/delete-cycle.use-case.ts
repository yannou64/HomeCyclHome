import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ICyclesRepository } from '../repositories/cycles.repository.interface';

export class DeleteCycleUseCase {
    constructor(private readonly repo: ICyclesRepository) {}

    async execute(id: string, utilisateurId: string): Promise<void> {
        const cycle = await this.repo.findById(id);

        if (!cycle) {
            throw new NotFoundException(`Cycle introuvable`);
        }

        // Règle métier : un client ne peut supprimer que ses propres cycles
        if (cycle.utilisateurId !== utilisateurId) {
            throw new ForbiddenException(`Accès refusé`);
        }

        return this.repo.delete(id);
    }
}
