import { apiClient } from '../../../shared/services/apiClient';
import type { Forfait, ForfaitPayload } from '../types/forfaits.types';

export const adminForfaitsService = {
  async getAll(): Promise<Forfait[]> {
    const r = await apiClient.get<Forfait[]>('/admin/forfaits');
    return r.data;
  },

  async create(payload: ForfaitPayload): Promise<Forfait> {
    const r = await apiClient.post<Forfait>('/admin/forfaits', payload);
    return r.data;
  },

  async update(id: string, payload: ForfaitPayload): Promise<Forfait> {
    const r = await apiClient.patch<Forfait>(`/admin/forfaits/${id}`, payload);
    return r.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/forfaits/${id}`);
  },

  async setPrix(id: string, payload: { montant: number; dateDebut: string }): Promise<void> {
    await apiClient.post(`/admin/forfaits/${id}/prix`, payload);
  },
};