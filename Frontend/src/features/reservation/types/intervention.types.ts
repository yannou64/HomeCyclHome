import type {
    AdresseBooking,
    CycleBooking,
} from '../../../app/providers/reservationContext/types/reservation.types';

// Entrée du service — utilise les types frontend du context
export type CreateInterventionRequest = {
    adresse: AdresseBooking;
    cycle: CycleBooking;
    forfaitId: string;
    creneauId: string;
    commentaire?: string;
};

// Réponse du backend — miroir de InterventionCreatedDto
export type InterventionCreatedDto = {
    id: string;
    statut: 'Planifiee' | 'Terminee' | 'Annulee';
    dateCreation: string;
};
