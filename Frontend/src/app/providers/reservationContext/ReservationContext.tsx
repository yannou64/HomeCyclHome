import { useState, type ReactNode } from 'react';
import { ReservationContext } from './reservation.context';
import type {
    AdresseBooking,
    CreneauInfo,
    CycleBooking,
    ForfaitInfo,
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
    const [cycle, setCycleState] = useState<CycleBooking | null>(null);
    const [forfait, setForfaitState] = useState<ForfaitInfo | null>(null);
    const [creneau, setCreneauState] = useState<CreneauInfo | null>(null);
    const [currentStep, setCurrentStep] = useState<ReservationStep>('adresse');

    const setAdresseAndZone = (a: AdresseBooking, z: ZoneInfo) => {
        setAdresse(a);
        setZone(z);
    };

    const setCycle = (c: CycleBooking) => setCycleState(c);

    const setForfait = (f: ForfaitInfo) => setForfaitState(f);

    const setCreneau = (c: CreneauInfo) => setCreneauState(c);

    const goToStep = (step: ReservationStep) => setCurrentStep(step);

    const reset = () => {
        setAdresse(null);
        setZone(null);
        setCycleState(null);
        setForfaitState(null);
        setCreneauState(null);
        setCurrentStep('adresse');
    };

    const value: ReservationContextType = {
        adresse,
        zone,
        cycle,
        forfait,
        creneau,
        currentStep,
        setAdresseAndZone,
        setCycle,
        setForfait,
        setCreneau,
        goToStep,
        reset,
    };

    return (
        <ReservationContext.Provider value={value}>
            {children}
        </ReservationContext.Provider>
    );
}
