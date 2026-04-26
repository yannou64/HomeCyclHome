import { apiClient } from '../../../shared/services/apiClient';
import type {
    AdminUser,
    CreateUserPayload,
    GetUsersParams,
    PaginatedUsers,
    UpdateUserPayload,
} from '../types/admin.types';

export const adminUsersService = {
    getUsers(params: GetUsersParams): Promise<PaginatedUsers> {
        return apiClient
            .get<PaginatedUsers>('/admin/users', { params })
            .then((r) => r.data);
    },

    createUser(payload: CreateUserPayload): Promise<AdminUser> {
        return apiClient
            .post<AdminUser>('/admin/users', payload)
            .then((r) => r.data);
    },

    updateUser(id: string, payload: UpdateUserPayload): Promise<AdminUser> {
        return apiClient
            .patch<AdminUser>(`/admin/users/${id}`, payload)
            .then((r) => r.data);
    },

    deleteUser(id: string): Promise<void> {
        return apiClient.delete(`/admin/users/${id}`).then(() => undefined);
    },
};
