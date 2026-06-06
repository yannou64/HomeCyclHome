import { useContext } from 'react';
import { ReservationContext } from './reservation.context';
import type { ReservationContextType } from './types/reservation.types';

export function useReservation(): ReservationContextType {
    const context = useContext(ReservationContext);
    if (context === undefined) {
        throw new Error(
            'useReservation doit être utilisé dans un ReservationProvider',
        );
    }
    return context;
}
