export type CreneauDisponibleDto = {
    id: string;
    dateDebut: string; // ISO 8601
    dateFin: string; // ISO 8601 — dateDebut + dureeMinutes du forfait
    technicienId: string | null;
    zoneId: string;
};
