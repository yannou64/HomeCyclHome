import { apiClient } from '../../../shared/services/apiClient';
import type { ZoneInfo } from '../../../app/providers/reservationContext/types/reservation.types';

export const reservationService = {
    checkZone(latitude: number, longitude: number): Promise<ZoneInfo> {
        return apiClient
            .post<ZoneInfo>('/zones/check', { latitude, longitude })
            .then((r) => r.data);
    },
};
