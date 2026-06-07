import { apiClient } from '../../../shared/services/apiClient';
import type { ZoneInfo } from '../../../app/providers/reservationContext/types/reservation.types';
import type { ForfaitDto } from '../types/forfait.types';

export const reservationService = {
    checkZone(latitude: number, longitude: number): Promise<ZoneInfo> {
        return apiClient
            .post<ZoneInfo>('/zones/check', { latitude, longitude })
            .then((r) => r.data);
    },

    getForfaits(): Promise<ForfaitDto[]> {
        return apiClient.get<ForfaitDto[]>('/forfaits').then((r) => r.data);
    },
};
