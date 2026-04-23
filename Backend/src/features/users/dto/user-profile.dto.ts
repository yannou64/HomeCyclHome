export type UserRole = 'client' | 'technicien' | 'admin';

export class UserProfileDto {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role: UserRole;
}
