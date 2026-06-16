import { apiClient } from '../../../shared/services/apiClient';
import type { AdminStats } from '../types/dashboard.types';

export const adminDashboardService = {
    getStats(): Promise<AdminStats> {
        return apiClient.get<AdminStats>('/admin/stats').then((r) => r.data);
    },
};
