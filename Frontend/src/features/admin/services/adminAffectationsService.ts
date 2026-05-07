import { apiClient } from '../../../shared/services/apiClient';
import type { AdminUser, PaginatedUsers } from '../types/admin.types';
import type {
  Affectation,
  SetTechnicienZonesPayload,
  ZoneAffectee,
} from '../types/affectations.types';

export const adminAffectationsService = {
  getAll(): Promise<Affectation[]> {
    return apiClient.get<Affectation[]>('/admin/affectations').then((r) => r.data);
  },

  setZones(technicienId: string, payload: SetTechnicienZonesPayload): Promise<Affectation> {
    return apiClient
      .put<Affectation>(`/admin/affectations/${technicienId}`, payload)
      .then((r) => r.data);
  },

  delete(technicienId: string): Promise<void> {
    return apiClient
      .delete(`/admin/affectations/${technicienId}`)
      .then(() => undefined);
  },

  // Données nécessaires au formulaire — appelées uniquement à l'ouverture du dialog
  getTechniciens(): Promise<AdminUser[]> {
    return apiClient
      .get<PaginatedUsers>('/admin/users', { params: { role: 'technicien', limit: 100 } })
      .then((r) => r.data.data);
  },

  getZones(): Promise<ZoneAffectee[]> {
    return apiClient.get<ZoneAffectee[]>('/admin/zones').then((r) => r.data);
  },
};