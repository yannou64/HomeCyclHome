export type CreneauDisponibleDto = {
    id: string;
    dateDebut: string; // ISO 8601
    dateFin: string; // ISO 8601 — dateDebut + dureeMinutes du forfait
    technicienId: string | null;
    technicienPrenom: string | null; // affiché dans le bloc du calendrier
    intervalleMinutes: number; // durée d'un slot de la grille
    zoneId: string;
};
