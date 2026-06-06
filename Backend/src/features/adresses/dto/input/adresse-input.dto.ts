import {
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateAdresseDto {
    @IsOptional()
    @IsString()
    numero?: string;

    @IsString()
    rue: string;

    @IsString()
    codePostal: string;

    @IsString()
    ville: string;

    @IsOptional()
    @IsString()
    pays?: string;

    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;

    @IsString()
    googlePlaceId: string;

    @IsOptional()
    @IsString()
    titreDescription?: string;

    @IsOptional()
    @IsBoolean()
    adressePrincipal?: boolean;
}

export class UpdateAdresseDto {
    @IsOptional()
    @IsString()
    titreDescription?: string;

    @IsOptional()
    @IsBoolean()
    adressePrincipal?: boolean;
}

// Types internes utilisés par les use cases (sans décorateurs class-validator)
export type CreateAdresseInput = {
    numero?: string;
    rue: string;
    codePostal: string;
    ville: string;
    pays?: string;
    latitude: number;
    longitude: number;
    googlePlaceId: string;
    titreDescription?: string;
    adressePrincipal?: boolean;
};

export type UpdateAdresseInput = {
    titreDescription?: string;
    adressePrincipal?: boolean;
};
