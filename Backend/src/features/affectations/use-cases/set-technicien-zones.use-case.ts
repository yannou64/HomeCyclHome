import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AffectationResponseDto } from '../dto/output/affectation-response.dto';
import { IAffectationsRepository } from '../repositories/affectations.repository.interface';

export class SetTechnicienZonesUseCase {
    constructor(private readonly repo: IAffectationsRepository) {}

    async execute(
        technicienId: string,
        zoneIds: string[],
    ): Promise<AffectationResponseDto> {
        if (zoneIds.length === 0) {
            throw new BadRequestException(
                'Au moins une zone doit être affectée.',
            );
        }

        const technicienValide = await this.repo.technicienExists(technicienId);
        if (!technicienValide) {
            throw new NotFoundException('Technicien introuvable.');
        }

        const zonesValides = await this.repo.zonesExist(zoneIds);
        if (!zonesValides) {
            throw new NotFoundException(
                'Une ou plusieurs zones sont introuvables.',
            );
        }

        return this.repo.setZonesForTechnicien(technicienId, zoneIds);
    }
}
