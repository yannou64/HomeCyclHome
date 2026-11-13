import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminDashboardService } from '../services/adminDashboardService';
import type { AdminStats } from '../types/dashboard.types';

// Loader défini hors du composant : référence stable, chargé une fois au montage.
const loadStats = (): Promise<AdminStats | null> =>
    adminDashboardService.getStats();

export function useAdminDashboard() {
    const {
        data: stats,
        isLoading,
        error,
    } = useAsyncData(
        loadStats,
        null,
        'Impossible de charger les statistiques.',
    );

    return { stats, isLoading, error };
}
