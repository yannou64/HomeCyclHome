import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminPlanningService } from '../services/adminPlanningService';
import type { AdminUser } from '../types/admin.types';

// Loader stable : défini hors du composant (Frontend/CLAUDE.md, section 5)
const loadTechniciens = () => adminPlanningService.getTechniciens();

/** Techniciens proposés dans le sélecteur de la section Planning. */
export function useTechniciens() {
    const { data, isLoading, error } = useAsyncData<AdminUser[]>(
        loadTechniciens,
        [],
        'Impossible de charger la liste des techniciens.',
    );
    return { techniciens: data, isLoading, error };
}
