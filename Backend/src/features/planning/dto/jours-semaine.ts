/**
 * Les sept jours de la semaine, dans l'ordre, sous le nom des colonnes
 * booléennes de `ModelesPlanification` (lundi … dimanche).
 *
 * L'API reçoit et renvoie une liste de jours (`['lundi', 'mercredi']`) ; le
 * repository la traduit en sept booléens pour la base.
 */
export const JOURS_SEMAINE = [
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
    'samedi',
    'dimanche',
] as const;

/** Un jour de la semaine : 'lundi' | 'mardi' | … | 'dimanche'. */
export type JourSemaine = (typeof JOURS_SEMAINE)[number];
