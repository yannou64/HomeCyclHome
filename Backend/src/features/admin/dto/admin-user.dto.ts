import { UserRole } from '../../users/dto/user-profile.dto';

// Shape d'un utilisateur tel qu'exposé par l'API admin (jamais de password_hash)
export type AdminUserDto = {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role: UserRole;
    isActif: boolean;
    dateCreation: Date;
};

// Réponse paginée : les données + les métadonnées de pagination
export type PaginatedUsersDto = {
    data: AdminUserDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};
