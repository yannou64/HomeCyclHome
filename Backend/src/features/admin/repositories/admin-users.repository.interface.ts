import { UserRole } from '../../users/dto/user-profile.dto';
import { AdminUserDto } from '../dto/admin-user.dto';

// Paramètres acceptés par findMany — reflète les filtres de PaginationQueryDto
export type FindManyUsersParams = {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
    is_actif?: boolean;
};

// Données nécessaires pour créer un utilisateur côté admin
export type CreateAdminUserData = {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role: UserRole;
    password: string; // sera hashé dans l'implémentation
};

// Toutes les propriétés sont optionnelles : on ne met à jour que ce qui change
export type UpdateAdminUserData = Partial<
    Omit<CreateAdminUserData, 'password'>
>;

// Le contrat : le UseCase dépend de cette interface, jamais de Prisma directement
export interface IAdminUsersRepository {
    findMany(
        params: FindManyUsersParams,
    ): Promise<{ users: AdminUserDto[]; total: number }>;
    findById(id: string): Promise<AdminUserDto | null>;
    findByEmail(email: string): Promise<AdminUserDto | null>;
    create(data: CreateAdminUserData): Promise<AdminUserDto>;
    update(id: string, data: UpdateAdminUserData): Promise<AdminUserDto>;
    delete(id: string): Promise<void>;
}
