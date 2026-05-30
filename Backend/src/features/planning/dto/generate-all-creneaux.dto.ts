import { IsISO8601, IsOptional, IsUUID } from 'class-validator';

export class GenerateAllCreneauxDto {
    @IsUUID()
    technicien_id: string;

    @IsISO8601()
    @IsOptional()
    date_fin_generation?: string;
}
