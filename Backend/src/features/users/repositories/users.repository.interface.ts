import { UserProfileResponseDto } from '../dto/output/user-profile-response.dto';

// Jeton d'injection : l'interface disparaît à la compilation, Nest
// retrouve l'implémentation par ce nom (voir le module).
export const USERS_REPO = 'USERS_REPO';

// Données acceptées pour la mise à jour — tous les champs sont optionnels (PATCH)
export type UpdateUserData = {
    nom?: string;
    prenom?: string;
    telephone?: string;
};

// Le contrat : les use cases dépendent de cette interface, jamais de Prisma directement
export interface IUsersRepository {
    findById(id: string): Promise<UserProfileResponseDto | null>;
    update(id: string, data: UpdateUserData): Promise<UserProfileResponseDto>;
    deleteById(id: string): Promise<void>;
}
