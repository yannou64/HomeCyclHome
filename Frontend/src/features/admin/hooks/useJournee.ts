import { useCallback } from 'react';
import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminPlanningService } from '../services/adminPlanningService';
import type { Journee } from '../types/planning.types';

/**
 * Cartes technicien et cartes zone de la date pivot, rechargées quand la date
 * change. Sans date (avant le premier chargement du calendrier) : rien.
 */
export function useJournee(date: string) {
    const loadJournee = useCallback(
        () => adminPlanningService.getJournee(date),
        [date],
    );
    const { data, isLoading, error } = useAsyncData<Journee | null>(
        loadJournee,
        null,
        'Impossible de charger la journée.',
        { enabled: date !== '' },
    );
    return { journee: data, isLoading, error };
}
