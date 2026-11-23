import { apiClient } from '../../../shared/services/apiClient';
import type { AdminUser, PaginatedUsers } from '../types/admin.types';
import type {
    ApercuPlanification,
    CouvertureMois,
    PlanifierPayload,
    ResultatPlanification,
    CreateModelePayload,
    EcranPlanification,
    Journee,
    ModeleDetail,
    ModelePlanification,
    ModeleResume,
    UpdateModelePayload,
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

    async getEcranPlanification(
        technicienId: string,
    ): Promise<EcranPlanification> {
        const r = await apiClient.get<EcranPlanification>(
            `${base(technicienId)}/planification`,
        );
        return r.data;
    },

    // Aperçu : valide la saisie et compte ce qu'elle remplacerait, sans écrire
    async apercuPlanification(
        technicienId: string,
        payload: PlanifierPayload,
    ): Promise<ApercuPlanification> {
        const r = await apiClient.post<ApercuPlanification>(
            `${base(technicienId)}/planification/apercu`,
            payload,
        );
        return r.data;
    },

    // Génération : refusée (409) sans confirmation si la période a déjà des
    // créneaux
    async planifier(
        technicienId: string,
        payload: PlanifierPayload,
    ): Promise<ResultatPlanification> {
        const r = await apiClient.post<ResultatPlanification>(
            `${base(technicienId)}/planification`,
            payload,
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

    async getModele(
        technicienId: string,
        modeleId: string,
    ): Promise<ModeleDetail> {
        const r = await apiClient.get<ModeleDetail>(
            `${base(technicienId)}/modeles/${modeleId}`,
        );
        return r.data;
    },

    // PUT : la modification remplace tout le modèle
    async updateModele(
        technicienId: string,
        modeleId: string,
        payload: UpdateModelePayload,
    ): Promise<ModelePlanification> {
        const r = await apiClient.put<ModelePlanification>(
            `${base(technicienId)}/modeles/${modeleId}`,
            payload,
        );
        return r.data;
    },

    async deleteModele(technicienId: string, modeleId: string): Promise<void> {
        await apiClient.delete(`${base(technicienId)}/modeles/${modeleId}`);
    },

    // Sans mois : celui du jour, à Paris (calculé par l'API)
    async getCouverture(mois: string | null): Promise<CouvertureMois> {
        const r = await apiClient.get<CouvertureMois>(
            '/admin/planning/couverture',
            { params: mois ? { mois } : {} },
        );
        return r.data;
    },

    async getJournee(date: string): Promise<Journee> {
        const r = await apiClient.get<Journee>('/admin/planning/journee', {
            params: { date },
        });
        return r.data;
    },
};
