import { apiClient } from '../../../shared/services/apiClient';
import type {
    AdminInterventionListItem,
    AdminInterventionDetail,
    GetAdminInterventionsParams,
} from '../types/adminIntervention.types';

export const adminInterventionsService = {
    async getInterventions(
        params: GetAdminInterventionsParams,
    ): Promise<AdminInterventionListItem[]> {
        const r = await apiClient.get<AdminInterventionListItem[]>('/admin/interventions', { params });
        return r.data;
    },

    async getInterventionDetail(id: string): Promise<AdminInterventionDetail> {
        const r = await apiClient.get<AdminInterventionDetail>(`/admin/interventions/${id}`);
        return r.data;
    },
};
