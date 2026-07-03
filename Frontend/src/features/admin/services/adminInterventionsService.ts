import { apiClient } from '../../../shared/services/apiClient';
import type {
    AdminInterventionDetail,
    GetAdminInterventionsParams,
    PaginatedAdminInterventions,
} from '../types/adminIntervention.types';

export const adminInterventionsService = {
    async getInterventions(
        params: GetAdminInterventionsParams,
    ): Promise<PaginatedAdminInterventions> {
        const r = await apiClient.get<PaginatedAdminInterventions>('/admin/interventions', { params });
        return r.data;
    },

    async getInterventionDetail(id: string): Promise<AdminInterventionDetail> {
        const r = await apiClient.get<AdminInterventionDetail>(`/admin/interventions/${id}`);
        return r.data;
    },
};
