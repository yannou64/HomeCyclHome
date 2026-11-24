import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { TechnicienJourneeResponseDto } from '../dto/output/journee-response.dto';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';
import {
    ajouterJours,
    instantDuJour,
    type JourCalendaire,
} from '../../../shared/domain/jour-travail';
import { carteTechnicien } from './get-journee.use-case';

/**
 * Journée d'un technicien (US-01 « Consulter le calendrier et la journée d'un
 * technicien 2.0 », séquence étapes 10 à 12) : sa zone du jour et ses
 * créneaux de 30 min, en minutes d'horloge à Paris, avec leur statut.
 *
 * Même format que sa carte sur la page de couverture : l'interface réutilise
 * la même carte et la même frise 7h–20h (RG3). Lecture seule.
 */
@Injectable()
export class GetJourneeTechnicienUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(
        technicienId: string,
        date: JourCalendaire,
    ): Promise<TechnicienJourneeResponseDto> {
        const technicien = await this.repo.trouverTechnicien(technicienId);
        if (!technicien) {
            throw new NotFoundException('Technicien introuvable.');
        }

        // La journée de Paris : de minuit à minuit (23 h ou 25 h aux
        // changements d'heure)
        const [creneaux, derniers] = await Promise.all([
            this.repo.trouverCreneauxEntre(
                instantDuJour(date, 0),
                instantDuJour(ajouterJours(date, 1), 0),
                technicienId,
            ),
            this.repo.derniersCreneaux(),
        ]);

        return carteTechnicien(
            technicien,
            creneaux,
            derniers.parTechnicien.get(technicienId),
        );
    }
}
