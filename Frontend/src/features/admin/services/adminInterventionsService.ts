import { apiClient } from '../../../shared/services/apiClient';
import type {
    AdminInterventionListItem,
    AdminInterventionDetail,
    GetAdminInterventionsParams,
} from '../types/adminIntervention.types';

export const adminInterventionsService = {
    getInterventions(
        params: GetAdminInterventionsParams,
    ): Promise<AdminInterventionListItem[]> {
        return apiClient
            .get<AdminInterventionListItem[]>('/admin/interventions', { params })
            .then((r) => r.data);
    },

    getInterventionDetail(id: string): Promise<AdminInterventionDetail> {
        return apiClient
            .get<AdminInterventionDetail>(`/admin/interventions/${id}`)
            .then((r) => r.data);
    },
};
