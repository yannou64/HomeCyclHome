import { IsEmail, IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { UserRole } from '../../users/dto/user-profile.dto';

export class UpdateAdminUserDto {
    @IsOptional()
    @IsString()
    nom?: string;

    @IsOptional()
    @IsString()
    prenom?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @Matches(/^(\+33|0)[1-9](\d{2}){4}$/, {
        message: 'Format de téléphone invalide',
    })
    telephone?: string;

    @IsOptional()
    @IsIn(['client', 'technicien', 'admin'])
    role?: UserRole;

    @IsOptional()
    is_actif?: boolean;
}
