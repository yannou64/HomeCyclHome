import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import type { PlanifierTechnicienDto } from '../dto/input/planifier-technicien.dto';
import type { ApercuPlanificationResponseDto } from '../dto/output/apercu-planification-response.dto';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';
import {
    ajouterJours,
    aujourdHui,
    instantDuJour,
} from '../../../shared/domain/jour-travail';
import { verifierBlocs } from './create-modele-planification.use-case';

/**
 * Contrôles d'une planification qui dépendent de plusieurs valeurs ou de la
 * base (le DTO a déjà refusé ce qui est faux en soi). Lance l'exception
 * adaptée au premier défaut trouvé.
 *
 * Règle du module : écrite ici, exportée pour la génération des créneaux
 * (US-03), jamais recopiée.
 */
export async function verifierPlanification(
    repo: IPlanningRepository,
    technicienId: string,
    saisie: PlanifierTechnicienDto,
): Promise<void> {
    if (!(await repo.technicienExiste(technicienId))) {
        throw new NotFoundException('Technicien introuvable.');
    }

    // RG2, RG3 : chaque bloc finit après son début, aucun ne chevauche un
    // autre (même règle que pour un modèle)
    verifierBlocs(saisie.blocs);

    // RG6 : la période commence au plus tôt demain, à Paris. Deux jours
    // `AAAA-MM-JJ` se comparent comme des chaînes : l'ordre alphabétique est
    // l'ordre chronologique.
    const demain = ajouterJours(aujourdHui(), 1);
    if (saisie.dateDebut < demain) {
        throw new BadRequestException(
            'La période commence au plus tôt demain.',
        );
    }
    // RG6 : fin supérieure ou égale au début (une seule journée possible)
    if (saisie.dateFin < saisie.dateDebut) {
        throw new BadRequestException(
            'La date de fin ne peut pas précéder la date de début.',
        );
    }

    // RG4, RG5 : la zone transmise est affectée au technicien et active, même
    // si le formulaire ne propose que celles-là (le serveur ne fait pas
    // confiance à la page)
    if (!(await repo.zoneAffecteeEtActive(technicienId, saisie.zoneId))) {
        throw new BadRequestException(
            'La zone doit être affectée au technicien et active.',
        );
    }
}

/**
 * Instants UTC qui bornent la période, en journées entières de Paris (RG9) :
 * du minuit du premier jour (inclus) au minuit du lendemain du dernier jour
 * (exclu). Justes aux changements d'heure (journées de 23 h ou 25 h).
 */
export function bornesDeLaPeriode(saisie: PlanifierTechnicienDto): {
    debut: Date;
    fin: Date;
} {
    return {
        debut: instantDuJour(saisie.dateDebut, 0),
        fin: instantDuJour(ajouterJours(saisie.dateFin, 1), 0),
    };
}

/**
 * Aperçu d'une planification (séquences de l'US-02, étapes 10 à 13, et de
 * l'US-03, étapes 2 à 6) : valide la saisie, puis compte ce qu'elle
 * remplacerait, pour l'avertissement (RG10). N'écrit rien.
 */
@Injectable()
export class ApercuPlanificationUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(
        technicienId: string,
        saisie: PlanifierTechnicienDto,
    ): Promise<ApercuPlanificationResponseDto> {
        await verifierPlanification(this.repo, technicienId, saisie);

        const { debut, fin } = bornesDeLaPeriode(saisie);
        const compte = await this.repo.compterPeriode(technicienId, debut, fin);
        return {
            creneauxSupprimes: compte.creneaux,
            interventionsTouchees: compte.interventions,
        };
    }
}
