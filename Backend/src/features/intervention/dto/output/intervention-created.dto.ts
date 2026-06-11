export type InterventionCreatedDto = {
    id: string;
    statut: 'Planifiee' | 'Terminee' | 'Annulee';
    dateCreation: string; // ISO 8601
};
