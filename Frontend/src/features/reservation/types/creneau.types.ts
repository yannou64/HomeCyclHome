export type CreneauDisponibleDto = {
    id: string;
    date_debut: string; // ISO 8601
    date_fin: string; // ISO 8601 — date_debut + dureeMinutes du forfait
    technicien_id: string | null;
    zone_id: string;
};
