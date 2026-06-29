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
    jourSemaine?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(1439)
    heureDebut?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(1440)
    heureFin?: number;

    @IsOptional()
    @IsInt()
    @Min(15)
    @Max(480)
    intervalleMinutes?: number;

    @IsOptional()
    @IsBoolean()
    isActif?: boolean;

    @IsOptional()
    @IsDateString()
    dateDebutValidite?: string;

    @IsOptional()
    @IsDateString()
    dateFinValidite?: string | null;
}
