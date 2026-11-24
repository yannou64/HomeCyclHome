import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { InterventionTechnicienResponseDto } from '../dto/output/intervention-technicien-response.dto';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';
import {
    ajouterJours,
    instantDuJour,
    minutesDuJour,
    type JourCalendaire,
} from '../../../shared/domain/jour-travail';

// RG1 de l'épique : un créneau dure toujours 30 minutes
const DUREE_CRENEAU = 30;

/**
 * Interventions du jour d'un technicien (US-02 « Consulter les interventions
 * d'un technicien 2.0 », séquence étapes 2 à 7) : celles portées par ses
 * créneaux réservés ce jour-là (RG4), triées par heure de début. Une En
 * conflit qui a gardé ses créneaux y figure, avec son statut. Lecture seule.
 */
@Injectable()
export class GetInterventionsTechnicienUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(
        technicienId: string,
        date: JourCalendaire,
    ): Promise<InterventionTechnicienResponseDto[]> {
        if (!(await this.repo.technicienExiste(technicienId))) {
            throw new NotFoundException('Technicien introuvable.');
        }

        // La journée de Paris : de minuit à minuit
        const interventions = await this.repo.trouverInterventionsDuJour(
            technicienId,
            instantDuJour(date, 0),
            instantDuJour(ajouterJours(date, 1), 0),
        );

        return (
            interventions
                .map(({ premierCreneau, dernierCreneau, ...reste }) => ({
                    ...reste,
                    // Heures d'horloge à Paris : du début du premier créneau
                    // réservé à la fin du dernier
                    debut: minutesDuJour(premierCreneau),
                    fin: minutesDuJour(dernierCreneau) + DUREE_CRENEAU,
                }))
                // Étape 6 : triées par heure de début (CA08)
                .sort((a, b) => a.debut - b.debut)
        );
    }
}
