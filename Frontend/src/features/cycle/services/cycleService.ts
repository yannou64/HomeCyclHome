import { apiClient } from '../../../shared/services/apiClient';
import type { Cycle, CreateCyclePayload, UpdateCyclePayload } from '../types/cycle.types';

export const cycleService = {
    async getAll(): Promise<Cycle[]> {
        const r = await apiClient.get<Cycle[]>('/cycles');
        return r.data;
    },

    async create(payload: CreateCyclePayload): Promise<Cycle> {
        const r = await apiClient.post<Cycle>('/cycles', payload);
        return r.data;
    },

    async update(id: string, payload: UpdateCyclePayload): Promise<Cycle> {
        const r = await apiClient.patch<Cycle>(`/cycles/${id}`, payload);
        return r.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/cycles/${id}`);
    },
};
