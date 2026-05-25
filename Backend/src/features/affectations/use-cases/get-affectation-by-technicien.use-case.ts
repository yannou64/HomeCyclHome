import { Inject, NotFoundException } from '@nestjs/common';
import { AffectationDto } from '../dto/affectation.dto';
import {
    AFFECTATIONS_REPO,
    IAffectationsRepository,
} from '../repositories/affectations.repository.interface';

export class GetAffectationByTechnicienUseCase {
    constructor(
        @Inject(AFFECTATIONS_REPO)
        private readonly repo: IAffectationsRepository,
    ) {}

    async execute(technicienId: string): Promise<AffectationDto> {
        const affectation = await this.repo.findByTechnicienId(technicienId);
        if (!affectation) {
            throw new NotFoundException(
                `Aucune affectation trouvée pour le technicien ${technicienId}`,
            );
        }
        return affectation;
    }
}
