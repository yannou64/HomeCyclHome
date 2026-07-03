import { apiClient } from '../../../shared/services/apiClient';
import type { Zone, CreateZonePayload, UpdateZonePayload } from '../types/zones.types';

export const adminZonesService = {
  async getAll(): Promise<Zone[]> {
    const r = await apiClient.get<Zone[]>('/admin/zones');
    return r.data;
  },

  async getById(id: string): Promise<Zone> {
    const r = await apiClient.get<Zone>(`/admin/zones/${id}`);
    return r.data;
  },

  async create(payload: CreateZonePayload): Promise<Zone> {
    const r = await apiClient.post<Zone>('/admin/zones', payload);
    return r.data;
  },

  async update(id: string, payload: UpdateZonePayload): Promise<Zone> {
    const r = await apiClient.patch<Zone>(`/admin/zones/${id}`, payload);
    return r.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/zones/${id}`);
  },
};