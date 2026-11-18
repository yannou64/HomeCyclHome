import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ModeleResumeResponseDto } from '../dto/output/modele-resume-response.dto';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';

/**
 * Modèles d'un technicien pour la page Planification (US-01 « Choisir le mode
 * de planification 2.0 », séquence étapes 2 à 8).
 */
@Injectable()
export class GetModelesUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(technicienId: string): Promise<ModeleResumeResponseDto[]> {
        if (!(await this.repo.technicienExiste(technicienId))) {
            throw new NotFoundException('Technicien introuvable.');
        }

        const modeles = await this.repo.trouverModeles(technicienId);

        // Étape 6 : marquer les modèles dont la zone n'est plus affectée au
        // technicien ou est devenue inactive (RG15). Le repository lit les
        // faits, la règle « valide » se décide ici.
        return modeles.map((m) => ({
            id: m.id,
            intitule: m.intitule,
            zone: {
                id: m.zone.id,
                nomZone: m.zone.nomZone,
                couleur: m.zone.couleur,
            },
            valide: m.zoneAffectee && m.zone.isActive,
        }));
    }
}
