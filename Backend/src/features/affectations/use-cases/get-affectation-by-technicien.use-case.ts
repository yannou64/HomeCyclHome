import { NotFoundException } from '@nestjs/common';
import { AffectationResponseDto } from '../dto/output/affectation-response.dto';
import { IAffectationsRepository } from '../repositories/affectations.repository.interface';

export class GetAffectationByTechnicienUseCase {
    constructor(private readonly repo: IAffectationsRepository) {}

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
