import { apiClient } from '../../../shared/services/apiClient';
import type { Adresse, CreateAdressePayload, UpdateAdressePayload } from '../types/adresse.types';

export const adresseService = {
    async getAll(): Promise<Adresse[]> {
        const r = await apiClient.get<Adresse[]>('/adresses');
        return r.data;
    },

    async create(payload: CreateAdressePayload): Promise<Adresse> {
        const r = await apiClient.post<Adresse>('/adresses', payload);
        return r.data;
    },

    async update(id: string, payload: UpdateAdressePayload): Promise<Adresse> {
        const r = await apiClient.patch<Adresse>(`/adresses/${id}`, payload);
        return r.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/adresses/${id}`);
    },
};
