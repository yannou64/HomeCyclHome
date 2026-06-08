import { apiClient } from '../../../shared/services/apiClient';
import type { ZoneInfo } from '../../../app/providers/reservationContext/types/reservation.types';
import type { ForfaitDto } from '../types/forfait.types';
import type { CreneauDisponibleDto } from '../types/creneau.types';

export const reservationService = {
    checkZone(latitude: number, longitude: number): Promise<ZoneInfo> {
        return apiClient
            .post<ZoneInfo>('/zones/check', { latitude, longitude })
            .then((r) => r.data);
    },

    getForfaits(): Promise<ForfaitDto[]> {
        return apiClient.get<ForfaitDto[]>('/forfaits').then((r) => r.data);
    },

    getCreneaux(params: {
        zoneId: string;
        dureeMinutes: number;
        dateDebut: string;
        dateFin: string;
    }): Promise<CreneauDisponibleDto[]> {
        return apiClient
            .get<CreneauDisponibleDto[]>('/creneaux', {
                params: {
                    zone_id: params.zoneId,
                    duree_minutes: params.dureeMinutes,
                    date_debut: params.dateDebut,
                    date_fin: params.dateFin,
                },
            })
            .then((r) => r.data);
    },
};
