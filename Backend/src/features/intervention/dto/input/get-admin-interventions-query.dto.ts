import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class GetAdminInterventionsQueryDto {
    @IsOptional()
    @IsIn(['Planifiee', 'archivees'])
    statut?: 'Planifiee' | 'archivees';

    @IsOptional()
    @IsUUID()
    zoneId?: string;

    @IsOptional()
    @IsUUID()
    technicienId?: string;
}
