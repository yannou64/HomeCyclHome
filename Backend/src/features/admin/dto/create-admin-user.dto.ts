import { IsEmail, IsIn, IsString, Matches, MinLength } from 'class-validator';
import { UserRole } from '../../users/dto/user-profile.dto';

export class CreateAdminUserDto {
    @IsString()
    nom: string;

    @IsString()
    prenom: string;

    @IsEmail()
    email: string;

    @IsString()
    @Matches(/^(\+33|0)[1-9](\d{2}){4}$/, {
        message: 'Format de téléphone invalide',
    })
    telephone: string;

    @IsIn(['client', 'technicien', 'admin'])
    role: UserRole;

    @IsString()
    @MinLength(8, {
        message: 'Le mot de passe doit faire au moins 8 caractères',
    })
    password: string;
}
