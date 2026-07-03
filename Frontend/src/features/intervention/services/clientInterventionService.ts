import { apiClient } from '../../../shared/services/apiClient';
import type { InterventionClientDto } from '../types/clientIntervention.types';

export const clientInterventionService = {
    async getMyInterventions(): Promise<InterventionClientDto[]> {
        const r = await apiClient.get<InterventionClientDto[]>('/interventions');
        return r.data;
    },

    async cancelIntervention(id: string): Promise<void> {
        await apiClient.patch(`/interventions/${id}/annuler`);
    },
};
