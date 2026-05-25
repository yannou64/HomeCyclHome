import { apiClient } from '../../../shared/services/apiClient';
import type { AdminUser, PaginatedUsers } from '../types/admin.types';
import type { ZoneAffectee } from '../types/affectations.types';
import type {
  CreateIndisponibilitePayload,
  CreateModelePlanificationPayload,
  CreatePauseRecurrentePayload,
  Indisponibilite,
  ModelePlanification,
  PauseRecurrente,
  UpdateModelePlanificationPayload,
} from '../types/planning.types';

export const adminPlanningService = {
  // ── Modèles de planification ────────────────────────────────────────────────

  getModeles(technicienId: string): Promise<ModelePlanification[]> {
    return apiClient
      .get<ModelePlanification[]>('/admin/planning/modeles', { params: { technicienId } })
      .then((r) => r.data);
  },

  createModele(payload: CreateModelePlanificationPayload): Promise<ModelePlanification> {
    return apiClient
      .post<ModelePlanification>('/admin/planning/modeles', payload)
      .then((r) => r.data);
  },

  updateModele(id: string, payload: UpdateModelePlanificationPayload): Promise<ModelePlanification> {
    return apiClient
      .patch<ModelePlanification>(`/admin/planning/modeles/${id}`, payload)
      .then((r) => r.data);
  },

  deleteModele(id: string): Promise<void> {
    return apiClient.delete(`/admin/planning/modeles/${id}`).then(() => undefined);
  },

  // ── Pauses récurrentes ──────────────────────────────────────────────────────

  getPauses(technicienId: string): Promise<PauseRecurrente[]> {
    return apiClient
      .get<PauseRecurrente[]>('/admin/planning/pauses', { params: { technicienId } })
      .then((r) => r.data);
  },

  createPause(payload: CreatePauseRecurrentePayload): Promise<PauseRecurrente> {
    return apiClient
      .post<PauseRecurrente>('/admin/planning/pauses', payload)
      .then((r) => r.data);
  },

  deletePause(id: string): Promise<void> {
    return apiClient.delete(`/admin/planning/pauses/${id}`).then(() => undefined);
  },

  // ── Indisponibilités ────────────────────────────────────────────────────────

  getIndisponibilites(technicienId: string): Promise<Indisponibilite[]> {
    return apiClient
      .get<Indisponibilite[]>('/admin/planning/indisponibilites', { params: { technicienId } })
      .then((r) => r.data);
  },

  createIndisponibilite(payload: CreateIndisponibilitePayload): Promise<Indisponibilite> {
    return apiClient
      .post<Indisponibilite>('/admin/planning/indisponibilites', payload)
      .then((r) => r.data);
  },

  deleteIndisponibilite(id: string): Promise<void> {
    return apiClient.delete(`/admin/planning/indisponibilites/${id}`).then(() => undefined);
  },

  // ── Données pour les formulaires ────────────────────────────────────────────

  getTechniciens(): Promise<AdminUser[]> {
    return apiClient
      .get<PaginatedUsers>('/admin/users', { params: { role: 'technicien', limit: 100 } })
      .then((r) => r.data.data);
  },

  getZonesForTechnicien(technicienId: string): Promise<ZoneAffectee[]> {
    return apiClient
      .get<{ technicien_id: string; zones: ZoneAffectee[] }>(`/admin/affectations/${technicienId}`)
      .then((r) => r.data.zones)
      .catch((err: { response?: { status?: number } }) => {
        // 404 = technicien sans affectation → pas de zones disponibles
        if (err?.response?.status === 404) return [];
        throw err;
      });
  },
};