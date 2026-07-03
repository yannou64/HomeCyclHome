import { createContext } from 'react';
import type { ReservationContextType } from './types/reservation.types';

// Séparé du provider pour satisfaire react-refresh/only-export-components
export const ReservationContext = createContext<ReservationContextType | undefined>(
    undefined,
);
