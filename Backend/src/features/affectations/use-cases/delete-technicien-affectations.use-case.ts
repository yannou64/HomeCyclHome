import { NotFoundException, Injectable, Inject } from '@nestjs/common';
import {
    AFFECTATIONS_REPO,
    type IAffectationsRepository,
} from '../repositories/affectations.repository.interface';

@Injectable()
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
