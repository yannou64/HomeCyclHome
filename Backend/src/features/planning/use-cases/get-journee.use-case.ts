import { Inject, Injectable } from '@nestjs/common';
import {
    JourneeResponseDto,
    TechnicienJourneeResponseDto,
    ZoneJourneeResponseDto,
} from '../dto/output/journee-response.dto';
import {
    PLANNING_REPO,
    type CreneauAvecZone,
    type IPlanningRepository,
    type TechnicienResume,
    type ZoneResume,
} from '../repositories/planning.repository.interface';
import {
    ajouterJours,
    instantDuJour,
    jourTravail,
    minutesDuJour,
    type JourCalendaire,
} from '../../../shared/domain/jour-travail';

/** Range les créneaux de la journée par une clé (technicien ou zone). */
function grouperPar(
    creneaux: CreneauAvecZone[],
    cle: (c: CreneauAvecZone) => string,
): Map<string, CreneauAvecZone[]> {
    const groupes = new Map<string, CreneauAvecZone[]>();
    for (const c of creneaux) {
        groupes.set(cle(c), [...(groupes.get(cle(c)) ?? []), c]);
    }
    return groupes;
}

/** Un instant → son jour de Paris ; pas de dernier créneau → null. */
const jourOuNull = (instant: Date | undefined): JourCalendaire | null =>
    instant ? jourTravail(instant) : null;

/**
 * Carte d'un technicien pour une journée : sa zone du jour, ses créneaux en
 * minutes d'horloge à Paris, « planifié jusqu'au ». Exportée pour la journée
 * de la page d'un technicien (« Consulter le planning d'un technicien 2.0 »).
 *
 * @param siens   ses créneaux de la journée
 * @param dernier début de son dernier créneau, toutes dates confondues
 */
export function carteTechnicien(
    t: TechnicienResume,
    siens: CreneauAvecZone[],
    dernier: Date | undefined,
): TechnicienJourneeResponseDto {
    return {
        id: t.id,
        prenom: t.prenom,
        nom: t.nom,
        // RG8 : sa zone du jour, il n'en a qu'une (RG2 de l'épique)
        zone: siens[0]?.zone ?? null,
        creneaux: siens
            .map((c) => ({
                debut: minutesDuJour(c.dateDebut),
                statut: c.statut,
            }))
            .sort((a, b) => a.debut - b.debut),
        // RG5 : jour de son dernier créneau, null = non planifié
        planifieJusquau: jourOuNull(dernier),
    };
}

/**
 * Journée pivot de la page Planning (US-02 « Consulter la journée des
 * techniciens et les disponibilités des zones 2.0 », séquence étapes 3 à 10).
 *
 * Lecture seule : le repository lit les faits (créneaux du jour, techniciens,
 * zones, derniers créneaux), le use case en déduit les cartes. Toutes les
 * heures et tous les jours sont ceux de Paris (fuseau d'exploitation).
 */
@Injectable()
export class GetJourneeUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(date: JourCalendaire): Promise<JourneeResponseDto> {
        // La journée de Paris : de minuit à minuit (23 h ou 25 h aux
        // changements d'heure)
        const [creneaux, techniciens, zones, derniers] = await Promise.all([
            this.repo.trouverCreneauxEntre(
                instantDuJour(date, 0),
                instantDuJour(ajouterJours(date, 1), 0),
            ),
            this.repo.trouverTechniciens(),
            this.repo.trouverZones(),
            this.repo.derniersCreneaux(),
        ]);
        const parTechnicien = grouperPar(creneaux, (c) => c.technicienId);
        const parZone = grouperPar(creneaux, (c) => c.zone.id);

        // Écart du 22/11/2026 : les techniciens actifs, plus tout technicien
        // qui a des créneaux ce jour-là ; les zones actives, plus les zones
        // inactives qui ont des créneaux ce jour-là (RG11)
        const cartesTechniciens: TechnicienJourneeResponseDto[] = techniciens
            .filter((t) => t.isActif || parTechnicien.has(t.id))
            .map((t) =>
                carteTechnicien(
                    t,
                    parTechnicien.get(t.id) ?? [],
                    derniers.parTechnicien.get(t.id),
                ),
            );

        const cartesZones: ZoneJourneeResponseDto[] = zones
            .filter((z) => z.isActive || parZone.has(z.id))
            .map((z) =>
                this.carteZone(
                    z,
                    parZone.get(z.id) ?? [],
                    derniers.parZone.get(z.id),
                ),
            );

        return { date, techniciens: cartesTechniciens, zones: cartesZones };
    }

    /**
     * RG9 : une tranche de 30 min est disponible dès qu'un technicien de la
     * zone y a un créneau Libre ; on ne garde que l'heure, jamais le nombre
     * de techniciens. Déplacement et Intervention réservée ne comptent pas.
     */
    private carteZone(
        zone: ZoneResume,
        creneaux: CreneauAvecZone[],
        dernier: Date | undefined,
    ): ZoneJourneeResponseDto {
        const tranchesLibres = [
            ...new Set(
                creneaux
                    .filter((c) => c.statut === 'Libre')
                    .map((c) => minutesDuJour(c.dateDebut)),
            ),
        ].sort((a, b) => a - b);

        let etat: ZoneJourneeResponseDto['etat'] = 'disponible';
        if (creneaux.length === 0) etat = 'non couverte';
        else if (tranchesLibres.length === 0) etat = 'complet';

        return {
            ...zone,
            etat,
            tranchesLibres,
            // RG6 : dernier jour couvert, tous techniciens confondus
            derniereCouverture: jourOuNull(dernier),
        };
    }
}
