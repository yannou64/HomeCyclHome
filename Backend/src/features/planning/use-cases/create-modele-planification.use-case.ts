import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import type { CreateModelePlanificationDto } from '../dto/input/create-modele-planification.dto';
import { ModelePlanificationResponseDto } from '../dto/output/modele-planification-response.dto';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';

type Bloc = { debut: number; fin: number };

/** 480 → « 8h00 », 810 → « 13h30 » : pour des messages lisibles. */
function heure(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h${m.toString().padStart(2, '0')}`;
}

/**
 * RG4, partie qui dépend de plusieurs valeurs. Deux blocs se chevauchent si
 * chacun commence avant la fin de l'autre ; deux blocs contigus (8h–10h puis
 * 10h–12h) ne se chevauchent pas (écart du 18/11/2026).
 *
 * Règle du module planning : écrite ici, exportée pour la modification d'un
 * modèle (et plus tard pour Planifier), jamais recopiée.
 */
export function verifierBlocs(blocs: Bloc[]): void {
    for (const b of blocs) {
        if (b.fin <= b.debut) {
            throw new BadRequestException(
                `La fin d’un bloc doit être après son début (${heure(b.debut)}–${heure(b.fin)}).`,
            );
        }
    }
    // Triés par début : il suffit de comparer chaque bloc au suivant
    const tries = [...blocs].sort((a, b) => a.debut - b.debut);
    for (let i = 1; i < tries.length; i++) {
        const precedent = tries[i - 1];
        const courant = tries[i];
        if (courant.debut < precedent.fin) {
            throw new BadRequestException(
                `Les blocs ${heure(precedent.debut)}–${heure(precedent.fin)} et ${heure(courant.debut)}–${heure(courant.fin)} se chevauchent.`,
            );
        }
    }
}

/**
 * Crée le modèle de planification d'un technicien (US-01 d'« Administrer les
 * modèles de planification 2.0 »).
 *
 * Le DTO a déjà refusé ce qui est faux en soi (intitulé vide ou trop long,
 * bloc hors bornes ou hors pas, aucun jour, aucun bloc). Le use case contrôle
 * ce qui dépend du reste : le technicien, la cohérence des blocs entre eux, la
 * zone et l'intitulé. Puis le repository écrit tout en une transaction.
 */
@Injectable()
export class CreateModelePlanificationUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(
        technicienId: string,
        saisie: CreateModelePlanificationDto,
    ): Promise<ModelePlanificationResponseDto> {
        // RG2 : un modèle appartient à un technicien, qui doit exister
        if (!(await this.repo.technicienExiste(technicienId))) {
            throw new NotFoundException('Technicien introuvable.');
        }

        // RG4 : blocs cohérents (fin après début, aucun chevauchement)
        verifierBlocs(saisie.blocs);

        // RG5 : zone affectée au technicien et active
        if (
            !(await this.repo.zoneAffecteeEtActive(technicienId, saisie.zoneId))
        ) {
            throw new BadRequestException(
                'La zone doit être affectée au technicien et active.',
            );
        }

        // RG3 : intitulé unique pour ce technicien, à la casse près. Contrôle
        // du use case seul (décision du 18/11/2026), comme la séquence : deux
        // créations simultanées du même intitulé ne sont pas départagées.
        if (await this.repo.intituleExiste(technicienId, saisie.intitule)) {
            throw new ConflictException(
                `Ce technicien a déjà un modèle intitulé « ${saisie.intitule} ».`,
            );
        }

        return this.repo.creerModele({
            technicienId,
            zoneId: saisie.zoneId,
            intitule: saisie.intitule, // déjà sans espaces autour (DTO)
            jours: saisie.jours,
            blocs: saisie.blocs,
        });
    }
}
