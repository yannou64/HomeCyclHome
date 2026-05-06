import { apiClient } from '../../../shared/services/apiClient';
import type { Zone, CreateZonePayload, UpdateZonePayload } from '../types/zones.types';

export const adminZonesService = {
  getAll(): Promise<Zone[]> {
    return apiClient.get<Zone[]>('/admin/zones').then((r) => r.data);
  },

  getById(id: string): Promise<Zone> {
    return apiClient.get<Zone>(`/admin/zones/${id}`).then((r) => r.data);
  },

  create(payload: CreateZonePayload): Promise<Zone> {
    return apiClient.post<Zone>('/admin/zones', payload).then((r) => r.data);
  },

  update(id: string, payload: UpdateZonePayload): Promise<Zone> {
    return apiClient.patch<Zone>(`/admin/zones/${id}`, payload).then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`/admin/zones/${id}`).then(() => undefined);
  },
};