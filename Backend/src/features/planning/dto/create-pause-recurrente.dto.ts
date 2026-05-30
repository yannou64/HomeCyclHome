import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class CreatePauseRecurrenteDto {
    @IsString()
    @IsNotEmpty()
    technicien_id: string;

    // null = pause valable tous les jours (ex: pause déjeuner)
    // 0=lundi … 6=dimanche pour une pause sur un jour précis
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(6)
    jour_semaine?: number | null;

    @IsInt()
    @Min(0)
    @Max(1439)
    heure_debut: number;

    @IsInt()
    @Min(1)
    @Max(1440)
    heure_fin: number;

    @IsOptional()
    @IsString()
    description?: string;
}
