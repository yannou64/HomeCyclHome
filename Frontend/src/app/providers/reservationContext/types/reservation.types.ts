import type {
    Adresse,
    DecomposedAddress,
} from '../../../../features/adresse/types/adresse.types';

// Union discriminée : on sait d'où vient l'adresse sans champ booléen ambigu
export type AdresseBooking =
    | { source: 'autocomplete'; data: DecomposedAddress }
    | { source: 'saved'; data: Adresse };

export type ZoneInfo = {
    zoneId: string;
    nomZone: string;
};

// Cycle choisi pour cette réservation (existant depuis le profil ou nouveau)
export type CycleBooking = {
    source: 'existing' | 'new';
    cycleId?: string; // renseigné uniquement si source === 'existing'
    typeCycleId: string;
    typeCycleLibelle: string;
    marqueId: string;
    marqueLibelle: string;
};

// Forfait choisi pour cette réservation
export type ForfaitInfo = {
    forfaitId: string;
    nom: string;
    dureeMinutes: number;
    prix: number | null;
};

export type ReservationStep =
    | 'adresse'
    | 'cycle'
    | 'forfait'
    | 'creneau'
    | 'auth'
    | 'confirmation';

export type ReservationContextType = {
    // Données du tunnel (null = étape pas encore complétée)
    adresse: AdresseBooking | null;
    zone: ZoneInfo | null;
    cycle: CycleBooking | null;
    forfait: ForfaitInfo | null;

    // Navigation
    currentStep: ReservationStep;

    // Actions
    setAdresseAndZone: (adresse: AdresseBooking, zone: ZoneInfo) => void;
    setCycle: (cycle: CycleBooking) => void;
    setForfait: (forfait: ForfaitInfo) => void;
    goToStep: (step: ReservationStep) => void;
    reset: () => void;
};
