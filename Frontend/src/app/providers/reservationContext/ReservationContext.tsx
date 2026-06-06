import { useState, type ReactNode } from 'react';
import { ReservationContext } from './reservation.context';
import type {
    AdresseBooking,
    ReservationContextType,
    ReservationStep,
    ZoneInfo,
} from './types/reservation.types';

type ReservationProviderProps = {
    children: ReactNode;
};

export function ReservationProvider({ children }: ReservationProviderProps) {
    const [adresse, setAdresse] = useState<AdresseBooking | null>(null);
    const [zone, setZone] = useState<ZoneInfo | null>(null);
    const [currentStep, setCurrentStep] = useState<ReservationStep>('adresse');

    const setAdresseAndZone = (a: AdresseBooking, z: ZoneInfo) => {
        setAdresse(a);
        setZone(z);
    };

    const goToStep = (step: ReservationStep) => setCurrentStep(step);

    const reset = () => {
        setAdresse(null);
        setZone(null);
        setCurrentStep('adresse');
    };

    const value: ReservationContextType = {
        adresse,
        zone,
        currentStep,
        setAdresseAndZone,
        goToStep,
        reset,
    };

    return (
        <ReservationContext.Provider value={value}>
            {children}
        </ReservationContext.Provider>
    );
}
