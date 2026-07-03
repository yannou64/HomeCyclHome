import {
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateIndisponibiliteDto {
    @IsString()
    @IsNotEmpty()
    technicienId: string;

    @IsDateString()
    dateDebut: string;

    @IsDateString()
    dateFin: string;

    @IsOptional()
    @IsString()
    motif?: string;
}
