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

// Créneau choisi pour cette réservation
export type CreneauInfo = {
    creneauId: string;
    dateDebut: string; // ISO 8601
    dateFin: string; // ISO 8601 — dateDebut + dureeMinutes
    technicienId: string | null;
};

// Données optionnelles saisies avant la confirmation
// photos : File[] en mémoire — uploadés lors du POST /interventions (HOM-315)
export type CommentaireInfo = {
    commentaire: string;
    photos: File[];
};

export type ReservationStep =
    | 'adresse'
    | 'cycle'
    | 'forfait'
    | 'creneau'
    | 'commentaire'
    | 'auth'
    | 'confirmation';

export type ReservationContextType = {
    // Données du tunnel (null = étape pas encore complétée)
    adresse: AdresseBooking | null;
    zone: ZoneInfo | null;
    cycle: CycleBooking | null;
    forfait: ForfaitInfo | null;
    creneau: CreneauInfo | null;
    commentaire: CommentaireInfo | null;

    // Navigation
    currentStep: ReservationStep;

    // Actions
    setAdresseAndZone: (adresse: AdresseBooking, zone: ZoneInfo) => void;
    setCycle: (cycle: CycleBooking) => void;
    setForfait: (forfait: ForfaitInfo) => void;
    setCreneau: (creneau: CreneauInfo) => void;
    setCommentaire: (commentaire: CommentaireInfo) => void;
    goToStep: (step: ReservationStep) => void;
    reset: () => void;
};
