import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateForfaitDto {
    @IsOptional()
    @IsString()
    nom?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    @Min(15)
    dureeMinutes?: number;

    @IsOptional()
    @IsBoolean()
    isActif?: boolean;
}
