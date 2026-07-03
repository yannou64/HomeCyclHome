import { apiClient } from '../../../shared/services/apiClient';
import type { CycleItemPayload, TypeCycle } from '../types/cycles.types';

export const adminTypeCyclesService = {
  async getAll(): Promise<TypeCycle[]> {
    const r = await apiClient.get<TypeCycle[]>('/admin/type-cycles');
    return r.data;
  },

  async create(payload: CycleItemPayload): Promise<TypeCycle> {
    const r = await apiClient.post<TypeCycle>('/admin/type-cycles', payload);
    return r.data;
  },

  async update(id: string, payload: CycleItemPayload): Promise<TypeCycle> {
    const r = await apiClient.patch<TypeCycle>(`/admin/type-cycles/${id}`, payload);
    return r.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/type-cycles/${id}`);
  },
};
