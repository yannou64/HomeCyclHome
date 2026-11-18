import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ZoneProposeeResponseDto } from '../dto/output/zone-proposee-response.dto';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';

/**
 * Zones proposées dans le formulaire de création d'un modèle (séquence,
 * étapes 2 à 7) : celles qui sont affectées au technicien et actives.
 */
@Injectable()
export class GetZonesProposeesUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(technicienId: string): Promise<ZoneProposeeResponseDto[]> {
        // Inexistant, ou utilisateur qui n'est pas technicien (écart du
        // 18/11/2026) : même réponse « introuvable »
        if (!(await this.repo.technicienExiste(technicienId))) {
            throw new NotFoundException('Technicien introuvable.');
        }
        return this.repo.trouverZonesProposees(technicienId);
    }
}
