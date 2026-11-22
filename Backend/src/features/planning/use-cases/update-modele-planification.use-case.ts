import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import type { UpdateModelePlanificationDto } from '../dto/input/update-modele-planification.dto';
import { ModelePlanificationResponseDto } from '../dto/output/modele-planification-response.dto';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';
import { verifierBlocs } from './create-modele-planification.use-case';
import { estModeleValide } from './get-modele.use-case';

/**
 * Modifie un modèle de planification (US-02 d'« Administrer les modèles de
 * planification 2.0 »). La modification remplace tout le modèle, sans
 * confirmation (RG8).
 *
 * Même partage qu'à la création : le DTO (hérité) refuse ce qui est faux en
 * soi, le use case contrôle ce qui dépend du reste, le repository remplace
 * modèle et blocs en une transaction.
 */
@Injectable()
export class UpdateModelePlanificationUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(
        technicienId: string,
        modeleId: string,
        saisie: UpdateModelePlanificationDto,
    ): Promise<ModelePlanificationResponseDto> {
        // RG10 : inexistant ou appartenant à un autre technicien → introuvable
        const actuel = await this.repo.trouverModele(technicienId, modeleId);
        if (!actuel) {
            throw new NotFoundException('Modèle introuvable.');
        }

        // RG11 : un modèle invalide ne se modifie pas, même vers une zone
        // valide ; l'admin le supprime et en crée un nouveau. 409 : le refus
        // vient de l'état du modèle, pas de la saisie.
        if (!estModeleValide(actuel)) {
            throw new ConflictException(
                'Ce modèle est invalide : sa zone n’est plus affectée au technicien ou est inactive. Supprimez-le et créez-en un nouveau.',
            );
        }

        // RG4 : blocs cohérents (fin après début, aucun chevauchement)
        verifierBlocs(saisie.blocs);

        // RG5 : la nouvelle zone doit être affectée au technicien et active
        if (
            !(await this.repo.zoneAffecteeEtActive(technicienId, saisie.zoneId))
        ) {
            throw new BadRequestException(
                'La zone doit être affectée au technicien et active.',
            );
        }

        // RG3 : intitulé unique pour ce technicien, à la casse près ; le
        // modèle lui-même ne compte pas (CA09)
        if (
            await this.repo.intituleExiste(
                technicienId,
                saisie.intitule,
                modeleId,
            )
        ) {
            throw new ConflictException(
                `Ce technicien a déjà un modèle intitulé « ${saisie.intitule} ».`,
            );
        }

        // RG2 : le technicien n'est pas dans les données remplacées
        const modifie = await this.repo.modifierModele(technicienId, modeleId, {
            zoneId: saisie.zoneId,
            intitule: saisie.intitule, // déjà sans espaces autour (DTO)
            jours: saisie.jours,
            blocs: saisie.blocs,
        });
        // Supprimé par un autre onglet entre la lecture et l'écriture
        if (!modifie) {
            throw new NotFoundException('Modèle introuvable.');
        }
        return modifie;
    }
}
