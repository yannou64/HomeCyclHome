import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ModeleDetailResponseDto } from '../dto/output/modele-detail-response.dto';
import {
    PLANNING_REPO,
    type IPlanningRepository,
    type ModeleDetail,
} from '../repositories/planning.repository.interface';

/**
 * RG11 : un modèle est valide si sa zone est encore affectée au technicien et
 * active. Exportée pour la modification, qui refuse un modèle invalide.
 */
export function estModeleValide(
    modele: Pick<ModeleDetail, 'zoneActive' | 'zoneAffectee'>,
): boolean {
    return modele.zoneAffectee && modele.zoneActive;
}

/**
 * Ouvre un modèle pour le modifier (US-02 « Modifier un modèle de
 * planification 2.0 », séquence étapes 2 à 8).
 *
 * Un modèle invalide se lit quand même, avec `valide: false` : l'écran
 * désactive son lien, et c'est l'enregistrement qui le refuse (CA05).
 */
@Injectable()
export class GetModeleUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(
        technicienId: string,
        modeleId: string,
    ): Promise<ModeleDetailResponseDto> {
        // RG10 : inexistant ou appartenant à un autre technicien → introuvable
        const modele = await this.repo.trouverModele(technicienId, modeleId);
        if (!modele) {
            throw new NotFoundException('Modèle introuvable.');
        }

        // Les faits sur la zone restent internes : seule la conclusion sort
        const { zoneActive, zoneAffectee, ...valeurs } = modele;
        return {
            ...valeurs,
            valide: estModeleValide({ zoneActive, zoneAffectee }),
        };
    }
}
