// Dates du calendrier affiché. FullCalendar donne chaque case du mois comme
// une date à minuit, heure locale du navigateur : on en lit le jour avec les
// accesseurs locaux. Ce n'est pas un calcul de fuseau : la date du jour et le
// regroupement des créneaux par jour de Paris sont faits par l'API.

const deux = (n: number) => String(n).padStart(2, '0');

/** Case du calendrier → 'AAAA-MM-JJ', clé des jours renvoyés par l'API. */
export function jourDeCase(date: Date): string {
    return `${date.getFullYear()}-${deux(date.getMonth() + 1)}-${deux(date.getDate())}`;
}

/** Premier jour du mois affiché → 'AAAA-MM'. */
export function moisDeCase(date: Date): string {
    return `${date.getFullYear()}-${deux(date.getMonth() + 1)}`;
}
