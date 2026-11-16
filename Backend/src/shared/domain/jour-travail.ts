/**
 * Fuseau d'exploitation (glossaire V2) : tous les jours se calculent à Paris,
 * jamais en UTC. Les dates sont stockées en UTC ; ces fonctions font le pont.
 *
 * Brique partagée du socle : tout calcul de jour passe par ici, jamais par
 * getDate(), setHours(), leurs variantes UTC ou toISOString().slice(0, 10).
 */

const FUSEAU = 'Europe/Paris';
const MINUTES_PAR_JOUR = 24 * 60;

/** Jour du calendrier de Paris, au format `YYYY-MM-DD`. */
export type JourCalendaire = string;

/**
 * Jour calendaire d'un instant, dans le fuseau d'exploitation.
 *
 * Les créneaux sont stockés en UTC alors que les journées de travail sont
 * définies en heure locale. Regrouper sur le jour UTC décalerait les bornes de
 * journée.
 */
export function jourTravail(date: string | Date): JourCalendaire {
    const instant = typeof date === 'string' ? new Date(date) : date;
    return instant.toLocaleDateString('en-CA', { timeZone: FUSEAU });
}

/** Jour calendaire courant à Paris. */
export function aujourdHui(maintenant: Date = new Date()): JourCalendaire {
    return jourTravail(maintenant);
}

/**
 * Instant UTC correspondant à une **heure d'horloge** à Paris : `jour` à
 * `minutes` après minuit (8h30 → 510). Juste aussi les jours de changement
 * d'heure, où « minuit + 8 h » ne tombe pas à 8h00 à l'horloge.
 */
export function instantDuJour(jour: JourCalendaire, minutes: number): Date {
    const [annee, mois, j] = lireJour(jour);
    // L'heure voulue, lue comme si elle était en UTC
    const nominal = Date.UTC(annee, mois - 1, j, 0, minutes);
    // Le décalage dépend de l'instant cherché, inconnu : on l'estime au
    // nominal, puis on le recalcule à l'instant estimé (deux passes suffisent).
    const estimation =
        nominal - decalageLocalMinutes(new Date(nominal)) * 60000;
    return new Date(
        nominal - decalageLocalMinutes(new Date(estimation)) * 60000,
    );
}

/**
 * Bornes UTC de la journée de travail d'un instant : de minuit à minuit moins
 * une milliseconde, heure de Paris. Une journée dure 23 h ou 25 h aux
 * changements d'heure : la fin est calculée sur le minuit du lendemain.
 */
export function bornesDuJourTravail(date: Date): { debut: Date; fin: Date } {
    const jour = jourTravail(date);
    const debut = instantDuJour(jour, 0);
    const minuitSuivant = instantDuJour(ajouterJours(jour, 1), 0);
    return { debut, fin: new Date(minuitSuivant.getTime() - 1) };
}

/** Le jour calendaire situé `n` jours après (ou avant si négatif). */
export function ajouterJours(jour: JourCalendaire, n: number): JourCalendaire {
    const [annee, mois, j] = lireJour(jour);
    // Arithmétique de calendrier pure, à midi UTC : aucun fuseau n'intervient,
    // et Date.UTC gère les fins de mois et d'année.
    return new Date(Date.UTC(annee, mois - 1, j + n, 12)).toLocaleDateString(
        'en-CA',
        { timeZone: 'UTC' },
    );
}

/** Jour de la semaine d'un jour calendaire : 0 = dimanche … 6 = samedi. */
export function jourDeSemaine(jour: JourCalendaire): number {
    const nom = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        timeZone: FUSEAU,
    }).format(instantDuJour(jour, MINUTES_PAR_JOUR / 2));
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(nom);
}

function lireJour(jour: JourCalendaire): [number, number, number] {
    const [annee, mois, j] = jour.split('-').map(Number);
    return [annee, mois, j];
}

// Décalage du fuseau d'exploitation par rapport à UTC, en minutes, à un instant
// donné (+60 en hiver, +120 en été).
function decalageLocalMinutes(date: Date): number {
    const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const local = new Date(date.toLocaleString('en-US', { timeZone: FUSEAU }));
    return (local.getTime() - utc.getTime()) / 60000;
}
