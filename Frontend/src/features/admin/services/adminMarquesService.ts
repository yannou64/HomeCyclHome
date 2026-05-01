import { apiClient } from '../../../shared/services/apiClient';
import type { CycleItemPayload, Marque } from '../types/cycles.types';

export const adminMarquesService = {
  getAll(): Promise<Marque[]> {
    return apiClient.get<Marque[]>('/admin/marques').then((r) => r.data);
  },

  create(payload: CycleItemPayload): Promise<Marque> {
    return apiClient.post<Marque>('/admin/marques', payload).then((r) => r.data);
  },

  update(id: string, payload: CycleItemPayload): Promise<Marque> {
    return apiClient.patch<Marque>(`/admin/marques/${id}`, payload).then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`/admin/marques/${id}`).then(() => undefined);
  },
};
