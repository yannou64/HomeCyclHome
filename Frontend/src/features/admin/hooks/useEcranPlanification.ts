import { useCallback } from 'react';
import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminPlanningService } from '../services/adminPlanningService';
import type { EcranPlanification } from '../types/planning.types';

/**
 * Ouverture de l'écran de planification d'un technicien : demain (calculé par
 * l'API à Paris) et les zones proposées. `ecran` vaut null tant qu'il n'est
 * pas chargé.
 */
export function useEcranPlanification(technicienId: string) {
    // Loader stable : recréé seulement si le technicien change
    const loadEcran = useCallback(
        () => adminPlanningService.getEcranPlanification(technicienId),
        [technicienId],
    );
    const { data, isLoading, error } = useAsyncData<EcranPlanification | null>(
        loadEcran,
        null,
        "Impossible d'ouvrir l'écran de planification.",
    );
    return { ecran: data, isLoading, error };
}
