import { apiClient } from '../../../shared/services/apiClient';
import type { CycleItemPayload, Marque } from '../types/cycles.types';

export const adminMarquesService = {
  async getAll(): Promise<Marque[]> {
    const r = await apiClient.get<Marque[]>('/admin/marques');
    return r.data;
  },

  async create(payload: CycleItemPayload): Promise<Marque> {
    const r = await apiClient.post<Marque>('/admin/marques', payload);
    return r.data;
  },

  async update(id: string, payload: CycleItemPayload): Promise<Marque> {
    const r = await apiClient.patch<Marque>(`/admin/marques/${id}`, payload);
    return r.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/marques/${id}`);
  },
};
