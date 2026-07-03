import { apiClient } from '../../../shared/services/apiClient';
import type {
    AdminUser,
    CreateUserPayload,
    GetUsersParams,
    PaginatedUsers,
    UpdateUserPayload,
} from '../types/admin.types';

export const adminUsersService = {
    async getUsers(params: GetUsersParams): Promise<PaginatedUsers> {
        const r = await apiClient.get<PaginatedUsers>('/admin/users', { params });
        return r.data;
    },

    async createUser(payload: CreateUserPayload): Promise<AdminUser> {
        const r = await apiClient.post<AdminUser>('/admin/users', payload);
        return r.data;
    },

    async updateUser(id: string, payload: UpdateUserPayload): Promise<AdminUser> {
        const r = await apiClient.patch<AdminUser>(`/admin/users/${id}`, payload);
        return r.data;
    },

    async deleteUser(id: string): Promise<void> {
        await apiClient.delete(`/admin/users/${id}`);
    },
};
