import { apiClient } from '../../../shared/services/apiClient';
import type { InterventionClientDto } from '../types/clientIntervention.types';

export const clientInterventionService = {
    getMyInterventions(): Promise<InterventionClientDto[]> {
        return apiClient
            .get<InterventionClientDto[]>('/interventions')
            .then((r) => r.data);
    },

    cancelIntervention(id: string): Promise<void> {
        return apiClient
            .patch(`/interventions/${id}/annuler`)
            .then(() => undefined);
    },
};
