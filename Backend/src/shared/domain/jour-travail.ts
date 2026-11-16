const FUSEAU = 'Europe/Paris';
const UN_JOUR_MS = 24 * 60 * 60 * 1000;

/**
 * Jour calendaire d'un créneau, au format `YYYY-MM-DD`, exprimé dans le fuseau
 * d'exploitation.
 *
 * Les créneaux sont stockés en UTC alors que les journées de travail sont
 * définies en heure locale par le modèle de planification. Regrouper sur le jour
 * UTC décalerait les bornes de journée deux fois par an.
 */
export function jourTravail(date: string | Date): string {
    const instant = typeof date === 'string' ? new Date(date) : date;
    return instant.toLocaleDateString('en-CA', { timeZone: FUSEAU });
}

/**
 * Bornes UTC encadrant la journée de travail à laquelle appartient une date :
 * de minuit à 23h59:59.999, heure locale.
 */
export function bornesDuJourTravail(date: Date): { debut: Date; fin: Date } {
    const [annee, mois, jour] = jourTravail(date).split('-').map(Number);

    // Minuit « nominal » : la bonne date calendaire, mais lue comme si elle était UTC
    const minuitNominal = Date.UTC(annee, mois - 1, jour);
    // Décalage local à cet instant (+60 min en hiver, +120 en été)
    const decalageMs =
        decalageLocalMinutes(new Date(minuitNominal)) * 60 * 1000;

    const debut = new Date(minuitNominal - decalageMs);
    return { debut, fin: new Date(debut.getTime() + UN_JOUR_MS - 1) };
}

// Décalage du fuseau d'exploitation par rapport à UTC, en minutes, à une date donnée
function decalageLocalMinutes(date: Date): number {
    const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const local = new Date(date.toLocaleString('en-US', { timeZone: FUSEAU }));
    return (local.getTime() - utc.getTime()) / 60000;
}
