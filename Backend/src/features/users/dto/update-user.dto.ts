import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    nom?: string;

    @IsOptional()
    @IsString()
    prenom?: string;

    @IsOptional()
    @IsString()
    @Matches(/^(\+33|0)[1-9](\d{2}){4}$/, {
        message: 'Numéro de téléphone invalide (format français attendu)',
    })
    telephone?: string;
}
