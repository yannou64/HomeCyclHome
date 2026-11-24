import { Inject, Injectable } from '@nestjs/common';
import {
    CouvertureMoisResponseDto,
    JourCouvertResponseDto,
    ZoneCouverteResponseDto,
} from '../dto/output/couverture-mois-response.dto';
import {
    PLANNING_REPO,
    type CreneauAvecZone,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';
import {
    aujourdHui,
    instantDuJour,
    jourTravail,
    type JourCalendaire,
} from '../../../shared/domain/jour-travail';

/** '2026-12' → '2027-01' : simple arithmétique de calendrier, sans fuseau. */
function moisSuivant(mois: string): string {
    const [annee, m] = mois.split('-').map(Number);
    return m === 12
        ? `${annee + 1}-01`
        : `${annee}-${String(m + 1).padStart(2, '0')}`;
}

/**
 * Calendrier de couverture d'un mois (US-01 « Consulter le calendrier de
 * couverture et choisir une date 2.0 », séquence étapes 4 à 8).
 *
 * Un jour est couvert pour une zone si au moins un technicien y a un créneau,
 * quel que soit son statut (RG2). Tous les jours sont ceux de Paris (RG4) :
 * un créneau du 1er/12 à 0h30 est stocké le 30/11 en UTC, il compte pour le
 * 1er/12.
 */
@Injectable()
export class GetCouvertureMoisUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(mois?: string): Promise<CouvertureMoisResponseDto> {
        // RG4 : date du jour dans le fuseau d'exploitation ; elle sert de
        // date pivot par défaut et choisit le mois quand aucun n'est demandé
        const jourCourant = aujourdHui();
        const moisVise = mois ?? jourCourant.slice(0, 7); // 'AAAA-MM-JJ' → 'AAAA-MM'

        const { debut, fin } = bornesDuMois(moisVise);
        const creneaux = await this.repo.trouverCreneauxEntre(debut, fin);

        return {
            mois: moisVise,
            aujourdHui: jourCourant,
            jours: joursCouverts(creneaux),
        };
    }
}

/**
 * Du 1er du mois à 0h00 au 1er du mois suivant à 0h00, heure de Paris.
 * Exportée pour le calendrier d'un technicien (« Consulter le planning d'un
 * technicien 2.0 »).
 */
export function bornesDuMois(mois: string): { debut: Date; fin: Date } {
    return {
        debut: instantDuJour(`${mois}-01`, 0),
        fin: instantDuJour(`${moisSuivant(mois)}-01`, 0),
    };
}

/**
 * Étape 7 : groupe les créneaux par jour de Paris, chaque zone une seule fois
 * par jour. Jours dans l'ordre, zones par nom : un affichage stable.
 * Exportée pour le calendrier d'un technicien, qui la reçoit filtrée sur lui :
 * il n'a alors qu'une zone par jour (RG2 de l'épique).
 */
export function joursCouverts(
    creneaux: CreneauAvecZone[],
): JourCouvertResponseDto[] {
    const parJour = new Map<
        JourCalendaire,
        Map<string, ZoneCouverteResponseDto>
    >();
    for (const c of creneaux) {
        const jour = jourTravail(c.dateDebut);
        const zones =
            parJour.get(jour) ?? new Map<string, ZoneCouverteResponseDto>();
        zones.set(c.zone.id, c.zone);
        parJour.set(jour, zones);
    }

    return [...parJour.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([jour, zones]) => ({
            jour,
            zones: [...zones.values()].sort((a, b) =>
                a.nomZone.localeCompare(b.nomZone),
            ),
        }));
}
