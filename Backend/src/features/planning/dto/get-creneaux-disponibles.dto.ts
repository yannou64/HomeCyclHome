import { Type } from 'class-transformer';
import { IsISO8601, IsInt, IsUUID, Min } from 'class-validator';

export class GetCreneauxDisponiblesQueryDto {
    @IsUUID()
    zoneId: string;

    // Les query params HTTP sont toujours des strings — @Type convertit en number avant @IsInt
    @Type(() => Number)
    @IsInt()
    @Min(1)
    dureeMinutes: number;

    @IsISO8601()
    dateDebut: string;

    @IsISO8601()
    dateFin: string;
}
