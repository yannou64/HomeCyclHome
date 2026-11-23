import { useCallback } from 'react';
import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminPlanningService } from '../services/adminPlanningService';
import type { ZoneProposee } from '../types/planning.types';

/**
 * Zones qu'on peut choisir pour un technicien : celles où il est affecté et
 * qui sont actives (le serveur filtre). Partagé par le formulaire d'un modèle
 * et par l'écran de planification.
 */
export function useZonesProposees(technicienId: string) {
    // Loader stable : il ne change que si le technicien change, et
    // useAsyncData recharge alors la liste tout seul
    const loadZones = useCallback(
        () => adminPlanningService.getZonesProposees(technicienId),
        [technicienId],
    );
    const { data, isLoading, error } = useAsyncData<ZoneProposee[]>(
        loadZones,
        [],
        'Impossible de charger les zones du technicien.',
    );
    return { zones: data, isLoadingZones: isLoading, zonesError: error };
}
