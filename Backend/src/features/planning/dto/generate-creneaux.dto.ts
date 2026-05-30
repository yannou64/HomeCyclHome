import { IsISO8601, IsOptional, IsUUID } from 'class-validator';

export class GenerateCreneauxDto {
    @IsUUID()
    modele_id: string;

    // Borne exclusive : les créneaux sont générés pour les jours strictement avant cette date.
    // Si absent : date_fin_validite du modèle, ou date_debut_validite + 6 mois.
    @IsISO8601()
    @IsOptional()
    date_fin_generation?: string;
}
