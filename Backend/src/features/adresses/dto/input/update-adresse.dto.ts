import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAdresseDto {
    @IsOptional()
    @IsString()
    titreDescription?: string;

    @IsOptional()
    @IsBoolean()
    adressePrincipal?: boolean;
}

export type UpdateAdresseInput = {
    titreDescription?: string;
    adressePrincipal?: boolean;
};
