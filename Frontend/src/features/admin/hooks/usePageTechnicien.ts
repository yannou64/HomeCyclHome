import { useCallback } from 'react';
import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminPlanningService } from '../services/adminPlanningService';
import type {
    CalendrierTechnicien,
    CarteTechnicien,
} from '../types/planning.types';

/**
 * Page d'un technicien (« Consulter le planning d'un technicien 2.0 ») : son
 * calendrier du mois affiché et sa journée du jour choisi. Deux chargements
 * indépendants : changer de jour ne recharge pas le mois, et inversement
 * (séquence de l'US-01, étapes 10 à 17).
 */
export function usePageTechnicien(
    technicienId: string,
    mois: string, // 'AAAA-MM'
    date: string, // 'AAAA-MM-JJ'
) {
    // Loaders stables : chacun ne change qu'avec ses propres paramètres
    const loadCalendrier = useCallback(
        () => adminPlanningService.getCalendrierTechnicien(technicienId, mois),
        [technicienId, mois],
    );
    const loadJournee = useCallback(
        () => adminPlanningService.getJourneeTechnicien(technicienId, date),
        [technicienId, date],
    );

    const calendrier = useAsyncData<CalendrierTechnicien | null>(
        loadCalendrier,
        null,
        'Impossible de charger le calendrier du technicien.',
    );
    const journee = useAsyncData<CarteTechnicien | null>(
        loadJournee,
        null,
        'Impossible de charger la journée du technicien.',
    );

    return {
        calendrier: calendrier.data,
        journee: journee.data,
        error: calendrier.error ?? journee.error,
    };
}
