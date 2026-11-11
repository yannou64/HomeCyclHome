import { NotFoundException } from '@nestjs/common';
import { IAffectationsRepository } from '../repositories/affectations.repository.interface';

export class DeleteTechnicienAffectationsUseCase {
    constructor(private readonly repo: IAffectationsRepository) {}

    async execute(technicienId: string): Promise<void> {
        const existe = await this.repo.technicienExists(technicienId);
        if (!existe) {
            throw new NotFoundException('Technicien introuvable.');
        }

        await this.repo.deleteForTechnicien(technicienId);
    }
}
