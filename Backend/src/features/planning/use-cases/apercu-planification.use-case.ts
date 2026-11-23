import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import type { PlanifierTechnicienDto } from '../dto/input/planifier-technicien.dto';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';
import { ajouterJours, aujourdHui } from '../../../shared/domain/jour-travail';
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
 * Aperçu d'une planification (US-02 « Définir les blocs, la zone, les jours
 * et la période 2.0 », séquence étapes 10 à 13) : valide la saisie, sans rien
 * écrire. L'US-03 y ajoute le nombre de créneaux et d'interventions touchés,
 * pour l'avertissement.
 */
@Injectable()
export class ApercuPlanificationUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(
        technicienId: string,
        saisie: PlanifierTechnicienDto,
    ): Promise<void> {
        await verifierPlanification(this.repo, technicienId, saisie);
    }
}
