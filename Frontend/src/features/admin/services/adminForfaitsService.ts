import { apiClient } from '../../../shared/services/apiClient';
import type { Forfait, ForfaitPayload } from '../types/forfaits.types';

export const adminForfaitsService = {
  getAll(): Promise<Forfait[]> {
    return apiClient.get<Forfait[]>('/admin/forfaits').then((r) => r.data);
  },

  create(payload: ForfaitPayload): Promise<Forfait> {
    return apiClient.post<Forfait>('/admin/forfaits', payload).then((r) => r.data);
  },

  update(id: string, payload: ForfaitPayload): Promise<Forfait> {
    return apiClient.patch<Forfait>(`/admin/forfaits/${id}`, payload).then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`/admin/forfaits/${id}`).then(() => undefined);
  },

  setPrix(id: string, payload: { montant: number; dateDebut: string }): Promise<void> {
    return apiClient.post(`/admin/forfaits/${id}/prix`, payload).then(() => undefined);
  },
};