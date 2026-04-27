import { apiClient } from '../../../shared/services/apiClient';
import type { CycleItemPayload, TypeCycle } from '../types/cycles.types';

export const adminTypeCyclesService = {
  getAll(): Promise<TypeCycle[]> {
    return apiClient.get<TypeCycle[]>('/admin/type-cycles').then((r) => r.data);
  },

  create(payload: CycleItemPayload): Promise<TypeCycle> {
    return apiClient.post<TypeCycle>('/admin/type-cycles', payload).then((r) => r.data);
  },

  update(id: string, payload: CycleItemPayload): Promise<TypeCycle> {
    return apiClient.patch<TypeCycle>(`/admin/type-cycles/${id}`, payload).then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`/admin/type-cycles/${id}`).then(() => undefined);
  },
};
