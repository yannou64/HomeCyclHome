import { useCallback } from 'react';
import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminPlanningService } from '../services/adminPlanningService';
import type { ZoneAffectee } from '../types/affectations.types';

// Zones affectées à un technicien : chargées à chaque ouverture du dialogue
// (enabled), jamais quand il est fermé.
export function useZonesForTechnicien(technicienId: string, isOpen: boolean) {
    // Le loader dépend du technicien : recréé (donc rechargé) quand il change.
    const loadZones = useCallback(
        () => adminPlanningService.getZonesForTechnicien(technicienId),
        [technicienId],
    );
    const {
        data: zones,
        isLoading: isLoadingZones,
        error: loadError,
    } = useAsyncData<ZoneAffectee[]>(
        loadZones,
        [],
        'Impossible de charger les zones du technicien.',
        { enabled: isOpen },
    );

    return { zones, isLoadingZones, loadError };
}
