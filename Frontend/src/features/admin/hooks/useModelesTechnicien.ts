import { useCallback } from 'react';
import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminPlanningService } from '../services/adminPlanningService';
import type { ModeleResume } from '../types/planning.types';

/**
 * Modèles d'un technicien (page Planification). Rechargés quand le technicien
 * change, et par reload() après la création d'un modèle.
 */
export function useModelesTechnicien(technicienId: string) {
    // Le loader dépend du technicien : recréé (donc rechargé) quand il change
    const loadModeles = useCallback(
        () => adminPlanningService.getModeles(technicienId),
        [technicienId],
    );
    const { data, isLoading, error, reload } = useAsyncData<ModeleResume[]>(
        loadModeles,
        [],
        'Impossible de charger les modèles du technicien.',
    );
    return { modeles: data, isLoading, error, reload };
}
