import { useCallback } from 'react';
import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminPlanningService } from '../services/adminPlanningService';
import type { ModeleDetail } from '../types/planning.types';

/** Un modèle ouvert pour être modifié (null tant qu'il n'est pas chargé). */
export function useModele(technicienId: string, modeleId: string) {
    // Loader stable : recréé seulement si le technicien ou le modèle change
    const loadModele = useCallback(
        () => adminPlanningService.getModele(technicienId, modeleId),
        [technicienId, modeleId],
    );
    const { data, isLoading, error } = useAsyncData<ModeleDetail | null>(
        loadModele,
        null,
        'Impossible de charger le modèle.',
    );
    return { modele: data, isLoading, error };
}
