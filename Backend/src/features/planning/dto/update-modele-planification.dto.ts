import {
    IsBoolean,
    IsDateString,
    IsInt,
    IsOptional,
    Max,
    Min,
} from 'class-validator';

// Tous les champs sont optionnels — on ne met à jour que ce qui est envoyé
export class UpdateModelePlanificationDto {
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(6)
    jour_semaine?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(1439)
    heure_debut?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(1440)
    heure_fin?: number;

    @IsOptional()
    @IsInt()
    @Min(15)
    @Max(480)
    intervalle_minutes?: number;

    @IsOptional()
    @IsBoolean()
    is_actif?: boolean;

    @IsOptional()
    @IsDateString()
    date_debut_validite?: string;

    @IsOptional()
    @IsDateString()
    date_fin_validite?: string | null;
}
