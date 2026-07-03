import { apiClient } from '../../../shared/services/apiClient';
import type { AdminUser, PaginatedUsers } from '../types/admin.types';
import type { ZoneAffectee } from '../types/affectations.types';
import type {
  Creneau,
  CreateIndisponibilitePayload,
  CreateModelePlanificationPayload,
  CreatePauseRecurrentePayload,
  GenerateAllCreneauxPayload,
  GenerateCreneauxPayload,
  GenerationRapport,
  Indisponibilite,
  ModelePlanification,
  PauseRecurrente,
  UpdateModelePlanificationPayload,
} from '../types/planning.types';

export const adminPlanningService = {
  // ── Modèles de planification ────────────────────────────────────────────────

  async getModeles(technicienId: string): Promise<ModelePlanification[]> {
    const r = await apiClient.get<ModelePlanification[]>('/admin/planning/modeles', {
      params: { technicienId },
    });
    return r.data;
  },

  async createModele(payload: CreateModelePlanificationPayload): Promise<ModelePlanification> {
    const r = await apiClient.post<ModelePlanification>('/admin/planning/modeles', payload);
    return r.data;
  },

  async updateModele(id: string, payload: UpdateModelePlanificationPayload): Promise<ModelePlanification> {
    const r = await apiClient.patch<ModelePlanification>(`/admin/planning/modeles/${id}`, payload);
    return r.data;
  },

  async deleteModele(id: string): Promise<void> {
    await apiClient.delete(`/admin/planning/modeles/${id}`);
  },

  // ── Pauses récurrentes ──────────────────────────────────────────────────────

  async getPauses(technicienId: string): Promise<PauseRecurrente[]> {
    const r = await apiClient.get<PauseRecurrente[]>('/admin/planning/pauses', {
      params: { technicienId },
    });
    return r.data;
  },

  async createPause(payload: CreatePauseRecurrentePayload): Promise<PauseRecurrente> {
    const r = await apiClient.post<PauseRecurrente>('/admin/planning/pauses', payload);
    return r.data;
  },

  async deletePause(id: string): Promise<void> {
    await apiClient.delete(`/admin/planning/pauses/${id}`);
  },

  // ── Indisponibilités ────────────────────────────────────────────────────────

  async getIndisponibilites(technicienId: string): Promise<Indisponibilite[]> {
    const r = await apiClient.get<Indisponibilite[]>('/admin/planning/indisponibilites', {
      params: { technicienId },
    });
    return r.data;
  },

  async createIndisponibilite(payload: CreateIndisponibilitePayload): Promise<Indisponibilite> {
    const r = await apiClient.post<Indisponibilite>('/admin/planning/indisponibilites', payload);
    return r.data;
  },

  async deleteIndisponibilite(id: string): Promise<void> {
    await apiClient.delete(`/admin/planning/indisponibilites/${id}`);
  },

  // ── Créneaux ────────────────────────────────────────────────────────────────

  async generateCreneaux(payload: GenerateCreneauxPayload): Promise<GenerationRapport> {
    const r = await apiClient.post<GenerationRapport>('/admin/planning/creneaux/generate', payload);
    return r.data;
  },

  async getCreneaux(technicienId: string, dateDebut: string, dateFin: string): Promise<Creneau[]> {
    const r = await apiClient.get<Creneau[]>('/admin/planning/creneaux', {
      params: { technicienId, dateDebut, dateFin },
    });
    return r.data;
  },

  async deleteCreneau(id: string): Promise<void> {
    await apiClient.delete(`/admin/planning/creneaux/${id}`);
  },

  async generateAllCreneaux(payload: GenerateAllCreneauxPayload): Promise<GenerationRapport> {
    const r = await apiClient.post<GenerationRapport>('/admin/planning/creneaux/generate-all', payload);
    return r.data;
  },

  async deleteCreneauxDisponibles(
    technicienId: string,
    dateDebut: string,
    dateFin: string,
  ): Promise<{ deleted: number }> {
    const r = await apiClient.delete<{ deleted: number }>('/admin/planning/creneaux/disponibles', {
      params: { technicienId, dateDebut, dateFin },
    });
    return r.data;
  },

  // ── Données pour les formulaires ────────────────────────────────────────────

  async getTechniciens(): Promise<AdminUser[]> {
    const r = await apiClient.get<PaginatedUsers>('/admin/users', {
      params: { role: 'technicien', limit: 100 },
    });
    return r.data.data;
  },

  async getZonesForTechnicien(technicienId: string): Promise<ZoneAffectee[]> {
    try {
      const r = await apiClient.get<{ technicienId: string; zones: ZoneAffectee[] }>(
        `/admin/affectations/${technicienId}`,
      );
      return r.data.zones;
    } catch (err) {
      // 404 = technicien sans affectation → pas de zones disponibles
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) return [];
      throw err;
    }
  },
};