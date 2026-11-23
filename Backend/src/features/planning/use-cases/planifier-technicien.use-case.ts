import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { PlanifierTechnicienDto } from '../dto/input/planifier-technicien.dto';
import { JOURS_SEMAINE } from '../dto/jours-semaine';
import type { PlanificationResponseDto } from '../dto/output/planification-response.dto';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';
import { entreeCommentaire } from '../../../shared/domain/commentaire-partage';
import {
    ajouterJours,
    instantDuJour,
    jourDeSemaine,
} from '../../../shared/domain/jour-travail';
import {
    bornesDeLaPeriode,
    verifierPlanification,
} from './apercu-planification.use-case';

// RG1 de l'épique : un créneau dure toujours 30 minutes
const DUREE_CRENEAU = 30;

// Texte de l'origine du conflit, imposé par RG16
const ORIGINE_CONFLIT = 'planning du technicien réinitialisé par l’admin';

/**
 * Début de chaque créneau à créer (RG7) : chaque jour de la période dont le
 * jour de semaine est choisi reçoit les créneaux de 30 minutes de chaque bloc.
 * Les heures sont celles de l'horloge de Paris, converties en instants UTC
 * (8h00 vaut 7h00 UTC en hiver, 6h00 UTC en été).
 */
export function creneauxDeLaPlanification(
    saisie: PlanifierTechnicienDto,
): Date[] {
    // 'lundi' → 1, … , 'dimanche' → 0 : la numérotation de jourDeSemaine
    // (0 = dimanche). JOURS_SEMAINE commence au lundi, d'où le décalage.
    const numerosChoisis = new Set(
        saisie.jours.map((j) => (JOURS_SEMAINE.indexOf(j) + 1) % 7),
    );
    const blocs = [...saisie.blocs].sort((a, b) => a.debut - b.debut);

    const instants: Date[] = [];
    // Les jours 'AAAA-MM-JJ' se comparent comme des chaînes
    for (
        let jour = saisie.dateDebut;
        jour <= saisie.dateFin;
        jour = ajouterJours(jour, 1)
    ) {
        if (!numerosChoisis.has(jourDeSemaine(jour))) continue;
        for (const bloc of blocs) {
            for (let m = bloc.debut; m < bloc.fin; m += DUREE_CRENEAU) {
                instants.push(instantDuJour(jour, m));
            }
        }
    }
    return instants;
}

/**
 * Génère les créneaux d'une planification (US-03 « Générer les créneaux et
 * réinitialiser la période 2.0 », séquence étapes 2 à 16).
 *
 * 1. Mêmes contrôles que l'aperçu (US-02).
 * 2. Sans confirmation, une période qui a déjà des créneaux est refusée
 *    (409, avec les nombres de l'avertissement) : rien n'est appliqué sans
 *    l'accord de l'admin (RG10). Une période vide passe sans avertissement.
 * 3. Le repository remplace les créneaux en une seule transaction.
 *
 * Aucun modèle n'est lu ni écrit : la saisie suffit (RG12).
 */
@Injectable()
export class PlanifierTechnicienUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(
        technicienId: string,
        saisie: PlanifierTechnicienDto,
    ): Promise<PlanificationResponseDto> {
        await verifierPlanification(this.repo, technicienId, saisie);

        const { debut, fin } = bornesDeLaPeriode(saisie);

        // RG10 : garde côté serveur, même si la page a déjà averti l'admin
        if (!saisie.confirmation) {
            const compte = await this.repo.compterPeriode(
                technicienId,
                debut,
                fin,
            );
            if (compte.creneaux > 0) {
                // Un objet en réponse : le message et les nombres, pour que
                // la page puisse afficher l'avertissement
                throw new ConflictException({
                    message:
                        'La période a déjà des créneaux : confirmez leur réinitialisation.',
                    creneauxSupprimes: compte.creneaux,
                    interventionsTouchees: compte.interventions,
                });
            }
        }

        const nouveaux = creneauxDeLaPlanification(saisie);
        const resultat = await this.repo.remplacerCreneaux({
            technicienId,
            zoneId: saisie.zoneId,
            debut,
            fin,
            nouveaux,
            // Horodatée maintenant, à l'heure de Paris (RG16)
            entreeConflit: entreeCommentaire(
                new Date(),
                'Système',
                ORIGINE_CONFLIT,
            ),
        });

        // Transaction annulée : le planning a changé pendant la génération
        if (!resultat) {
            throw new ConflictException(
                'Le planning du technicien a changé pendant la génération : rien n’a été modifié, réessayez.',
            );
        }

        return {
            creneauxCrees: nouveaux.length,
            creneauxSupprimes: resultat.creneauxSupprimes,
            interventionsEnConflit: resultat.interventionsEnConflit,
        };
    }
}
