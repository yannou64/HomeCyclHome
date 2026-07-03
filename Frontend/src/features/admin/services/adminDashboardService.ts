import { apiClient } from '../../../shared/services/apiClient';
import type { AdminStats } from '../types/dashboard.types';

export const adminDashboardService = {
    async getStats(): Promise<AdminStats> {
        const r = await apiClient.get<AdminStats>('/admin/stats');
        return r.data;
    },
};
