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

    // Navigation
    currentStep: ReservationStep;

    // Actions
    setAdresseAndZone: (adresse: AdresseBooking, zone: ZoneInfo) => void;
    goToStep: (step: ReservationStep) => void;
    reset: () => void;
};
