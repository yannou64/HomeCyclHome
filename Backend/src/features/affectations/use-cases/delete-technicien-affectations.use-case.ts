import { Inject, NotFoundException } from '@nestjs/common';
import {
    AFFECTATIONS_REPO,
    IAffectationsRepository,
} from '../repositories/affectations.repository.interface';

export class DeleteTechnicienAffectationsUseCase {
    constructor(
        @Inject(AFFECTATIONS_REPO)
        private readonly repo: IAffectationsRepository,
    ) {}

    async execute(technicienId: string): Promise<void> {
        const existe = await this.repo.technicienExists(technicienId);
        if (!existe) {
            throw new NotFoundException('Technicien introuvable.');
        }

        await this.repo.deleteForTechnicien(technicienId);
    }
}
