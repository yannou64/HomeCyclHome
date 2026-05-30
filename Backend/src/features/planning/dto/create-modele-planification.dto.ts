import {
    IsBoolean,
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class CreateModelePlanificationDto {
    @IsString()
    @IsNotEmpty()
    technicien_id: string;

    @IsString()
    @IsNotEmpty()
    zone_id: string;

    // 0=lundi … 6=dimanche
    @IsInt()
    @Min(0)
    @Max(6)
    jour_semaine: number;

    // Minutes depuis minuit : 0 = 00h00, 1439 = 23h59
    @IsInt()
    @Min(0)
    @Max(1439)
    heure_debut: number;

    @IsInt()
    @Min(1)
    @Max(1440)
    heure_fin: number;

    // Durée minimale d'un créneau : 15 minutes
    @IsInt()
    @Min(15)
    @Max(480)
    intervalle_minutes: number;

    @IsOptional()
    @IsBoolean()
    is_actif?: boolean;

    @IsDateString()
    date_debut_validite: string;

    @IsOptional()
    @IsDateString()
    date_fin_validite?: string;
}
