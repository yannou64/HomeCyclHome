import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminAffectationsService } from '../services/adminAffectationsService';
import type { AdminUser } from '../types/admin.types';
import type { ZoneAffectee } from '../types/affectations.types';

interface AffectationFormData {
    techniciens: AdminUser[];
    zones: ZoneAffectee[];
}

const DONNEES_VIDES: AffectationFormData = { techniciens: [], zones: [] };

// Loader défini hors du composant : référence stable.
async function loadFormData(): Promise<AffectationFormData> {
    const [techniciens, zones] = await Promise.all([
        adminAffectationsService.getTechniciens(),
        adminAffectationsService.getZones(),
    ]);
    return { techniciens, zones };
}

// Données du formulaire (techniciens + zones) : chargées à chaque ouverture
// du dialogue (enabled), jamais quand il est fermé.
export function useAffectationFormData(isOpen: boolean) {
    const {
        data: { techniciens, zones },
        isLoading: isLoadingData,
        error: loadError,
    } = useAsyncData(
        loadFormData,
        DONNEES_VIDES,
        'Impossible de charger les données du formulaire.',
        { enabled: isOpen },
    );

    return { techniciens, zones, isLoadingData, loadError };
}
