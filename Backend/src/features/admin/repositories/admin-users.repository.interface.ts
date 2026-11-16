import { UserRole } from '../../users/dto/output/user-profile-response.dto';
import { AdminUserResponseDto } from '../dto/output/admin-user-response.dto';

// Jeton d'injection : l'interface disparaît à la compilation, Nest
// retrouve l'implémentation par ce nom (voir le module).
export const ADMIN_USERS_REPO = 'ADMIN_USERS_REPO';

// Paramètres acceptés par findMany — reflète les filtres de GetUsersQueryDto
export type FindManyUsersParams = {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
    isActif?: boolean;
};

// Données nécessaires pour créer un utilisateur côté admin
export type CreateAdminUserData = {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role: UserRole;
    password: string; // en clair : le use case le hache avant d'appeler le repository
};

// Ce que le repository enregistre : l'identité et le mot de passe déjà haché
export type NewAdminUserData = Omit<CreateAdminUserData, 'password'> & {
    passwordHash: string;
};

// Toutes les propriétés sont optionnelles : on ne met à jour que ce qui change
export type UpdateAdminUserData = Partial<
    Omit<CreateAdminUserData, 'password'>
>;

// Le contrat : le UseCase dépend de cette interface, jamais de Prisma directement
export interface IAdminUsersRepository {
    findMany(
        params: FindManyUsersParams,
    ): Promise<{ users: AdminUserResponseDto[]; total: number }>;
    findById(id: string): Promise<AdminUserResponseDto | null>;
    findByEmail(email: string): Promise<AdminUserResponseDto | null>;
    create(data: NewAdminUserData): Promise<AdminUserResponseDto>;
    update(
        id: string,
        data: UpdateAdminUserData,
    ): Promise<AdminUserResponseDto>;
    delete(id: string): Promise<void>;
}
