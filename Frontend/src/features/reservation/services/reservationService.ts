import { apiClient } from '../../../shared/services/apiClient';
import type { ZoneInfo } from '../../../app/providers/reservationContext/types/reservation.types';
import type { ForfaitDto } from '../types/forfait.types';
import type { CreneauDisponibleDto } from '../types/creneau.types';

export const reservationService = {
    async checkZone(latitude: number, longitude: number): Promise<ZoneInfo> {
        const r = await apiClient.post<ZoneInfo>('/zones/check', { latitude, longitude });
        return r.data;
    },

    async getForfaits(): Promise<ForfaitDto[]> {
        const r = await apiClient.get<ForfaitDto[]>('/forfaits');
        return r.data;
    },

    async getCreneaux(params: {
        zoneId: string;
        dureeMinutes: number;
        dateDebut: string;
        dateFin: string;
    }): Promise<CreneauDisponibleDto[]> {
        const r = await apiClient.get<CreneauDisponibleDto[]>('/creneaux', {
            params: {
                zoneId: params.zoneId,
                dureeMinutes: params.dureeMinutes,
                dateDebut: params.dateDebut,
                dateFin: params.dateFin,
            },
        });
        return r.data;
    },
};
