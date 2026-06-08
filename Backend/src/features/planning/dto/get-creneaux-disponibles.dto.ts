import { Type } from 'class-transformer';
import { IsISO8601, IsInt, IsUUID, Min } from 'class-validator';

export class GetCreneauxDisponiblesQueryDto {
    @IsUUID()
    zone_id: string;

    // Les query params HTTP sont toujours des strings — @Type convertit en number avant @IsInt
    @Type(() => Number)
    @IsInt()
    @Min(1)
    duree_minutes: number;

    @IsISO8601()
    date_debut: string;

    @IsISO8601()
    date_fin: string;
}
