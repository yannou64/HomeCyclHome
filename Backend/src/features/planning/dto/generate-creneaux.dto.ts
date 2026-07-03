import { IsISO8601, IsOptional, IsUUID } from 'class-validator';

export class GenerateCreneauxDto {
    @IsUUID()
    modeleId: string;

    // Borne exclusive : les créneaux sont générés pour les jours strictement avant cette date.
    // Si absent : dateFinValidite du modèle, ou dateDebutValidite + 6 mois.
    @IsISO8601()
    @IsOptional()
    dateFinGeneration?: string;
}
