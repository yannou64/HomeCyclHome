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
    technicienId: string;

    @IsString()
    @IsNotEmpty()
    zoneId: string;

    // 0=lundi … 6=dimanche
    @IsInt()
    @Min(0)
    @Max(6)
    jourSemaine: number;

    // Minutes depuis minuit : 0 = 00h00, 1439 = 23h59
    @IsInt()
    @Min(0)
    @Max(1439)
    heureDebut: number;

    @IsInt()
    @Min(1)
    @Max(1440)
    heureFin: number;

    // Durée minimale d'un créneau : 15 minutes
    @IsInt()
    @Min(15)
    @Max(480)
    intervalleMinutes: number;

    @IsOptional()
    @IsBoolean()
    isActif?: boolean;

    @IsDateString()
    dateDebutValidite: string;

    @IsOptional()
    @IsDateString()
    dateFinValidite?: string;
}
