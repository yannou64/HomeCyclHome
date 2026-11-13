import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCycleDto {
    @IsOptional()
    @IsString()
    libelle?: string;

    @IsOptional()
    @IsUUID()
    marqueId?: string;

    @IsOptional()
    @IsUUID()
    typeCycleId?: string;

    @IsOptional()
    @IsString()
    particularite?: string;
}

export type UpdateCycleInput = {
    libelle?: string;
    marqueId?: string;
    typeCycleId?: string;
    particularite?: string;
};
