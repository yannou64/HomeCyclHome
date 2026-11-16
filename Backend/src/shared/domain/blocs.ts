/**
 * Calcul des blocs et arrondi de la durée d'un forfait — brique partagée du
 * socle, utilisée par la réservation et par la création d'une intervention par
 * l'admin. Règles : RG5, RG7 à RG12 de « (Client) Réserver une intervention 2.0 ».
 *
 * Vocabulaire (glossaire V2) :
 * - un **bloc** = un déplacement, N créneaux d'intervention, un déplacement,
 *   contigus, du même technicien, de la même zone et du même jour ;
 * - une **suite** = des créneaux contigus planifiés d'un technicien. Son premier
 *   et son dernier créneau servent au départ et au retour du magasin : un bloc
 *   ne traverse jamais le trou entre deux suites.
 *
 * Fonctions pures : aucun accès à la base, aucun import Nest ni Prisma.
 */
import { jourTravail, type JourCalendaire } from './jour-travail';

const DUREE_CRENEAU_MIN = 30;
const DUREE_CRENEAU_MS = DUREE_CRENEAU_MIN * 60 * 1000;

export type StatutCreneau = 'Libre' | 'InterventionReservee' | 'Deplacement';

/** Ce que le calcul lit d'un créneau, et rien d'autre. */
export type CreneauPlanifie = {
    id: string;
    technicienId: string;
    zoneId: string;
    dateDebut: Date;
    statut: StatutCreneau;
};

/**
 * Créneau servant de déplacement : un créneau Libre consommé, ou un créneau
 * Déplacement déjà posé par une intervention voisine, alors réutilisé (RG10).
 */
export type Deplacement = { creneauId: string; reutilise: boolean };

export type BlocPossible = {
    technicienId: string;
    jour: JourCalendaire;
    debut: Date; // début de l'intervention, après le déplacement aller
    fin: Date; // fin arrondie (RG16)
    deplacementAvant: Deplacement;
    creneauxIntervention: string[]; // les N créneaux à réserver, dans l'ordre
    deplacementApres: Deplacement;
};

/**
 * Nombre de créneaux d'intervention d'un forfait : sa durée arrondie au
 * multiple de 30 minutes supérieur, divisée par 30 (RG7). 45 min → 2.
 */
export function nombreDeCreneaux(dureeMinutes: number): number {
    if (!(dureeMinutes > 0)) {
        throw new Error(
            'La durée d’un forfait doit être strictement positive.',
        );
    }
    return Math.ceil(dureeMinutes / DUREE_CRENEAU_MIN);
}

/** Heure de fin affichée : le début plus N créneaux de 30 min (RG16). */
export function finArrondie(debut: Date, dureeMinutes: number): Date {
    return new Date(
        debut.getTime() + nombreDeCreneaux(dureeMinutes) * DUREE_CRENEAU_MS,
    );
}

/**
 * Tous les blocs possibles pour un forfait dans une zone, parmi des créneaux
 * de plusieurs techniciens et de plusieurs jours, triés par heure de début.
 */
export function blocsPossibles(
    creneaux: CreneauPlanifie[],
    zoneId: string,
    dureeMinutes: number,
): BlocPossible[] {
    const n = nombreDeCreneaux(dureeMinutes);
    const blocs: BlocPossible[] = [];

    // RG8 : seule la zone demandée compte (CA13)
    const dansLaZone = creneaux.filter((c) => c.zoneId === zoneId);

    // RG8 : un bloc ne mélange ni les techniciens ni les jours (CA12)
    for (const groupe of grouperParTechnicienEtJour(dansLaZone).values()) {
        for (const s of decouperEnSuites(groupe)) {
            // RG11 : le bloc a besoin d'un créneau avant (i - 1) et d'un créneau
            // après (i + n) DANS la suite. Le premier créneau d'une suite ne
            // débute donc jamais une intervention, et le dernier n'en fait
            // jamais partie (CA07). RG12 : un bloc ne sort pas de sa suite (CA08).
            for (let i = 1; i + n < s.length; i++) {
                const avant = s[i - 1];
                const intervention = s.slice(i, i + n);
                const apres = s[i + n];

                // RG5 : seuls des créneaux Libres portent l'intervention (CA10, CA11)
                if (!intervention.every((c) => c.statut === 'Libre')) continue;
                // RG9, RG10 : chaque déplacement est Libre, ou Déplacement réutilisé
                if (!peutServirDeDeplacement(avant)) continue;
                if (!peutServirDeDeplacement(apres)) continue;

                const debut = intervention[0].dateDebut;
                blocs.push({
                    technicienId: avant.technicienId,
                    jour: jourTravail(debut),
                    debut,
                    fin: finArrondie(debut, dureeMinutes),
                    deplacementAvant: versDeplacement(avant),
                    creneauxIntervention: intervention.map((c) => c.id),
                    deplacementApres: versDeplacement(apres),
                });
            }
        }
    }

    return blocs.sort((a, b) => a.debut.getTime() - b.debut.getTime());
}

function peutServirDeDeplacement(c: CreneauPlanifie): boolean {
    return c.statut === 'Libre' || c.statut === 'Deplacement';
}

function versDeplacement(c: CreneauPlanifie): Deplacement {
    return { creneauId: c.id, reutilise: c.statut === 'Deplacement' };
}

// Regroupe par technicien et par jour calendaire de Paris, chaque groupe trié
// par heure de début.
function grouperParTechnicienEtJour(
    creneaux: CreneauPlanifie[],
): Map<string, CreneauPlanifie[]> {
    const groupes = new Map<string, CreneauPlanifie[]>();
    for (const c of creneaux) {
        const cle = `${c.technicienId}|${jourTravail(c.dateDebut)}`;
        const groupe = groupes.get(cle) ?? [];
        groupe.push(c);
        groupes.set(cle, groupe);
    }
    for (const groupe of groupes.values()) {
        groupe.sort((a, b) => a.dateDebut.getTime() - b.dateDebut.getTime());
    }
    return groupes;
}

// Découpe des créneaux triés en suites contiguës : deux créneaux se suivent
// s'ils sont espacés d'exactement 30 min. Tout écart (pause, trou) coupe.
function decouperEnSuites(tries: CreneauPlanifie[]): CreneauPlanifie[][] {
    const suites: CreneauPlanifie[][] = [];
    for (const c of tries) {
        const courante = suites[suites.length - 1];
        const precedent = courante?.[courante.length - 1];
        if (
            precedent &&
            c.dateDebut.getTime() - precedent.dateDebut.getTime() ===
                DUREE_CRENEAU_MS
        ) {
            courante.push(c);
        } else {
            suites.push([c]);
        }
    }
    return suites;
}
