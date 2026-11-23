import type { ResultatPlanification } from '../types/planning.types';

/** « 56 créneaux générés. 2 interventions passées en conflit. » */
export function messageResultat(r: ResultatPlanification): string {
    const creneaux =
        r.creneauxCrees > 1
            ? `${r.creneauxCrees} créneaux générés.`
            : `${r.creneauxCrees} créneau généré.`;
    if (r.interventionsEnConflit === 0) return creneaux;
    const conflits =
        r.interventionsEnConflit > 1
            ? `${r.interventionsEnConflit} interventions passées en conflit.`
            : '1 intervention passée en conflit.';
    return `${creneaux} ${conflits}`;
}
