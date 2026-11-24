import { useCallback } from 'react';
import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminPlanningService } from '../services/adminPlanningService';
import type {
    CalendrierTechnicien,
    CarteTechnicien,
    InterventionTechnicien,
} from '../types/planning.types';

/**
 * Page d'un technicien (« Consulter le planning d'un technicien 2.0 ») : son
 * calendrier du mois affiché, sa journée et ses interventions du jour choisi.
 * Chargements indépendants : changer de jour ne recharge pas le mois, et
 * inversement (séquences des US-01 et US-02).
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
    const loadInterventions = useCallback(
        () =>
            adminPlanningService.getInterventionsTechnicien(technicienId, date),
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

    const interventions = useAsyncData<InterventionTechnicien[]>(
        loadInterventions,
        [],
        'Impossible de charger les interventions du technicien.',
    );

    return {
        calendrier: calendrier.data,
        journee: journee.data,
        interventions: interventions.data,
        isLoadingInterventions: interventions.isLoading,
        error: calendrier.error ?? journee.error ?? interventions.error,
    };
}
