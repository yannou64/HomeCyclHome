import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class GetAdminInterventionsQueryDto {
    @IsOptional()
    @IsIn(['Planifiee', 'enRetard', 'archivees'])
    statut?: 'Planifiee' | 'enRetard' | 'archivees';

    @IsOptional()
    @IsUUID()
    zoneId?: string;

    @IsOptional()
    @IsUUID()
    technicienId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 6;
}
