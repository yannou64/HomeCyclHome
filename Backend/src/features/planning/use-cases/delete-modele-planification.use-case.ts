import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';

/**
 * Supprime un modèle de planification et ses blocs (US-03 d'« Administrer les
 * modèles de planification 2.0 »). La confirmation se fait à l'écran (RG9) :
 * quand la demande arrive, l'admin a cliqué sur *Continuer*.
 *
 * Valide ou invalide, un modèle se supprime de la même façon (RG11), et les
 * créneaux ne sont pas touchés : ils ne portent aucun lien vers un modèle (RG7).
 */
@Injectable()
export class DeleteModelePlanificationUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(technicienId: string, modeleId: string): Promise<void> {
        // La lecture et la suppression ne font qu'une : la suppression
        // conditionnelle dit à elle seule si le modèle existait pour ce
        // technicien. Pas de « lire puis supprimer », qu'un autre onglet
        // pourrait devancer entre les deux.
        const supprime = await this.repo.supprimerModele(
            technicienId,
            modeleId,
        );
        // RG10 : inexistant, d'un autre technicien ou déjà supprimé
        if (!supprime) {
            throw new NotFoundException('Modèle introuvable.');
        }
    }
}
