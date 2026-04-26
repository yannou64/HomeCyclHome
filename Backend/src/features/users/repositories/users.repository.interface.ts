import { UserProfileDto } from '../dto/user-profile.dto';

// Données acceptées pour la mise à jour — tous les champs sont optionnels (PATCH)
export type UpdateUserData = {
    nom?: string;
    prenom?: string;
    telephone?: string;
};

// Le contrat : les use cases dépendent de cette interface, jamais de Prisma directement
export interface IUsersRepository {
    findById(id: string): Promise<UserProfileDto | null>;
    update(id: string, data: UpdateUserData): Promise<UserProfileDto>;
}
