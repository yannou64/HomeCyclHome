import { useCallback } from 'react';
import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminPlanningService } from '../services/adminPlanningService';
import type { CouvertureMois } from '../types/planning.types';

/**
 * Calendrier de couverture d'un mois. `mois` à null : le mois du jour (l'API
 * le choisit et renvoie la date du jour). Pendant le chargement d'un autre
 * mois, les données précédentes restent affichées (useAsyncData).
 */
export function useCouvertureMois(mois: string | null) {
    const loadCouverture = useCallback(
        () => adminPlanningService.getCouverture(mois),
        [mois],
    );
    const { data, isLoading, error } = useAsyncData<CouvertureMois | null>(
        loadCouverture,
        null,
        'Impossible de charger la couverture des zones.',
    );
    return { couverture: data, isLoading, error };
}
