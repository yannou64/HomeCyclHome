import { apiClient } from '../../../shared/services/apiClient';
import type { Cycle, CreateCyclePayload, UpdateCyclePayload } from '../types/cycle.types';

export const cycleService = {
    getAll(): Promise<Cycle[]> {
        return apiClient.get<Cycle[]>('/cycles').then((r) => r.data);
    },

    create(payload: CreateCyclePayload): Promise<Cycle> {
        return apiClient.post<Cycle>('/cycles', payload).then((r) => r.data);
    },

    update(id: string, payload: UpdateCyclePayload): Promise<Cycle> {
        return apiClient.patch<Cycle>(`/cycles/${id}`, payload).then((r) => r.data);
    },

    delete(id: string): Promise<void> {
        return apiClient.delete(`/cycles/${id}`).then(() => undefined);
    },
};
