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
    technicienId: string;

    // null = pause valable tous les jours (ex: pause déjeuner)
    // 0=lundi … 6=dimanche pour une pause sur un jour précis
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(6)
    jourSemaine?: number | null;

    @IsInt()
    @Min(0)
    @Max(1439)
    heureDebut: number;

    @IsInt()
    @Min(1)
    @Max(1440)
    heureFin: number;

    @IsOptional()
    @IsString()
    description?: string;
}
