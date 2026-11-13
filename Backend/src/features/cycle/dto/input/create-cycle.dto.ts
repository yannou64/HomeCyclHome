import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCycleDto {
    @IsString()
    libelle!: string;

    @IsUUID()
    marqueId!: string;

    @IsUUID()
    typeCycleId!: string;

    @IsOptional()
    @IsString()
    particularite?: string;
}

// Types internes (utilisés par les use cases et le repository — pas de décorateurs)
export type CreateCycleInput = {
    libelle: string;
    marqueId: string;
    typeCycleId: string;
    particularite?: string;
};
