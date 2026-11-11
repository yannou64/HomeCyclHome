import { NotFoundException } from '@nestjs/common';
import { AffectationDto } from '../dto/affectation.dto';
import { IAffectationsRepository } from '../repositories/affectations.repository.interface';

export class GetAffectationByTechnicienUseCase {
    constructor(private readonly repo: IAffectationsRepository) {}

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
