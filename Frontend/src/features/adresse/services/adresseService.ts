import { apiClient } from '../../../shared/services/apiClient';
import type { Adresse, CreateAdressePayload, UpdateAdressePayload } from '../types/adresse.types';

export const adresseService = {
    getAll(): Promise<Adresse[]> {
        return apiClient.get<Adresse[]>('/adresses').then((r) => r.data);
    },

    create(payload: CreateAdressePayload): Promise<Adresse> {
        return apiClient.post<Adresse>('/adresses', payload).then((r) => r.data);
    },

    update(id: string, payload: UpdateAdressePayload): Promise<Adresse> {
        return apiClient.patch<Adresse>(`/adresses/${id}`, payload).then((r) => r.data);
    },

    delete(id: string): Promise<void> {
        return apiClient.delete(`/adresses/${id}`).then(() => undefined);
    },
};
