import { apiClient } from '../../../shared/services/apiClient';
import type { AdminUser, PaginatedUsers } from '../types/admin.types';
import type {
  Affectation,
  SetTechnicienZonesPayload,
  ZoneAffectee,
} from '../types/affectations.types';

export const adminAffectationsService = {
  async getAll(): Promise<Affectation[]> {
    const r = await apiClient.get<Affectation[]>('/admin/affectations');
    return r.data;
  },

  async setZones(technicienId: string, payload: SetTechnicienZonesPayload): Promise<Affectation> {
    const r = await apiClient.put<Affectation>(`/admin/affectations/${technicienId}`, payload);
    return r.data;
  },

  async delete(technicienId: string): Promise<void> {
    await apiClient.delete(`/admin/affectations/${technicienId}`);
  },

  // Données nécessaires au formulaire — appelées uniquement à l'ouverture du dialog
  async getTechniciens(): Promise<AdminUser[]> {
    const r = await apiClient.get<PaginatedUsers>('/admin/users', {
      params: { role: 'technicien', limit: 100 },
    });
    return r.data.data;
  },

  async getZones(): Promise<ZoneAffectee[]> {
    const r = await apiClient.get<ZoneAffectee[]>('/admin/zones');
    return r.data;
  },
};