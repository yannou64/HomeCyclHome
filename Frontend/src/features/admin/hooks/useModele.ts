import { useCallback } from 'react';
import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminPlanningService } from '../services/adminPlanningService';
import type { ModeleDetail } from '../types/planning.types';

/**
 * Un modèle ouvert sur l'écran de planification (null tant qu'il n'est pas
 * chargé). Sans `modeleId` (planification libre), rien n'est chargé.
 */
export function useModele(technicienId: string, modeleId?: string) {
    // Loader stable : recréé seulement si le technicien ou le modèle change
    const loadModele = useCallback(
        // Jamais appelé sans modeleId : le chargement est alors suspendu
        () => adminPlanningService.getModele(technicienId, modeleId ?? ''),
        [technicienId, modeleId],
    );
    const { data, isLoading, error } = useAsyncData<ModeleDetail | null>(
        loadModele,
        null,
        'Impossible de charger le modèle.',
        { enabled: modeleId !== undefined },
    );
    return { modele: data, isLoading, error };
}
