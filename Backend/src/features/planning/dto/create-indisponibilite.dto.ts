import {
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateIndisponibiliteDto {
    @IsString()
    @IsNotEmpty()
    technicien_id: string;

    @IsDateString()
    date_debut: string;

    @IsDateString()
    date_fin: string;

    @IsOptional()
    @IsString()
    motif?: string;
}