import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateForfaitDto {
    @IsString()
    nom: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsInt()
    @Min(15)
    dureeMinutes: number;

    @IsOptional()
    @IsBoolean()
    isActif?: boolean;
}
