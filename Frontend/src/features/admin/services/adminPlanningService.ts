import { apiClient } from '../../../shared/services/apiClient';
import type { AdminUser, PaginatedUsers } from '../types/admin.types';
import type {
    CreateModelePayload,
    ModelePlanification,
    ModeleResume,
    ZoneProposee,
} from '../types/planning.types';

// Routes du planning V2 : /admin/planning/techniciens/:technicienId/…
const base = (technicienId: string) =>
    `/admin/planning/techniciens/${technicienId}`;

export const adminPlanningService = {
    async getTechniciens(): Promise<AdminUser[]> {
        const r = await apiClient.get<PaginatedUsers>('/admin/users', {
            params: { role: 'technicien', limit: 100 },
        });
        return r.data.data;
    },

    async getModeles(technicienId: string): Promise<ModeleResume[]> {
        const r = await apiClient.get<ModeleResume[]>(
            `${base(technicienId)}/modeles`,
        );
        return r.data;
    },

    async getZonesProposees(technicienId: string): Promise<ZoneProposee[]> {
        const r = await apiClient.get<ZoneProposee[]>(
            `${base(technicienId)}/zones`,
        );
        return r.data;
    },

    async createModele(
        technicienId: string,
        payload: CreateModelePayload,
    ): Promise<ModelePlanification> {
        const r = await apiClient.post<ModelePlanification>(
            `${base(technicienId)}/modeles`,
            payload,
        );
        return r.data;
    },
};
