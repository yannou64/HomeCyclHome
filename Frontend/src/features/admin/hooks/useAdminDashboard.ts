import { useEffect, useState } from 'react';
import { adminDashboardService } from '../services/adminDashboardService';
import type { AdminStats } from '../types/dashboard.types';

export function useAdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        adminDashboardService
            .getStats()
            .then(setStats)
            .catch(() => setError('Impossible de charger les statistiques.'))
            .finally(() => setIsLoading(false));
    }, []);

    return { stats, isLoading, error };
}
