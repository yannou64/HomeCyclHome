import { IsISO8601, IsOptional, IsUUID } from 'class-validator';

export class GenerateAllCreneauxDto {
    @IsUUID()
    technicienId: string;

    @IsISO8601()
    @IsOptional()
    dateFinGeneration?: string;
}
