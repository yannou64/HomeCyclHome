import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import {
    IPlanningRepository,
    PLANNING_REPO,
} from '../repositories/planning.repository.interface';

export class DeleteCreneauUseCase {
    constructor(
        @Inject(PLANNING_REPO)
        private readonly repo: IPlanningRepository,
    ) {}

    async execute(id: string): Promise<void> {
        const creneau = await this.repo.findCreneauById(id);

        if (!creneau) {
            throw new NotFoundException(`Créneau introuvable : ${id}`);
        }

        // Un créneau réservé est lié à une Intervention — le supprimer créerait une incohérence
        if (!creneau.isDisponible) {
            throw new ConflictException(
                "Ce créneau est déjà réservé. Annulez l'intervention associée avant de le supprimer.",
            );
        }

        await this.repo.deleteCreneau(id);
    }
}
