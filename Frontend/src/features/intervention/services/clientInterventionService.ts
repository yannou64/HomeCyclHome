import { apiClient } from '../../../shared/services/apiClient';
import type { InterventionClient } from '../types/clientIntervention.types';

export const clientInterventionService = {
    async getMyInterventions(): Promise<InterventionClient[]> {
        const r = await apiClient.get<InterventionClient[]>('/interventions');
        return r.data;
    },

    async cancelIntervention(id: string): Promise<void> {
        await apiClient.patch(`/interventions/${id}/annuler`);
    },
};
