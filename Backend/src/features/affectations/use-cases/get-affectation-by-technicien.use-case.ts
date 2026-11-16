import { NotFoundException, Injectable, Inject } from '@nestjs/common';
import { AffectationResponseDto } from '../dto/output/affectation-response.dto';
import {
    AFFECTATIONS_REPO,
    type IAffectationsRepository,
} from '../repositories/affectations.repository.interface';

@Injectable()
export class GetAffectationByTechnicienUseCase {
    constructor(
        @Inject(AFFECTATIONS_REPO)
        private readonly repo: IAffectationsRepository,
    ) {}

    async execute(technicienId: string): Promise<AffectationResponseDto> {
        const affectation = await this.repo.findByTechnicienId(technicienId);
        if (!affectation) {
            throw new NotFoundException(
                `Aucune affectation trouvée pour le technicien ${technicienId}`,
            );
        }
        return affectation;
    }
}
