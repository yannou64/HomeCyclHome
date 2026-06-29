import type { Role } from '../../../app/providers/authContext/types/auth.types';

export type AdminUser = {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role: Role;
    isActif: boolean;
    dateCreation: string;
};

export type PaginationMeta = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type PaginatedUsers = {
    data: AdminUser[];
    meta: PaginationMeta;
};

export type GetUsersParams = {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    isActif?: boolean;
};

export type CreateUserPayload = {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role: Role;
    password: string;
};

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'password'>>;
