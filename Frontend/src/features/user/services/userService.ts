import { apiClient } from '../../../shared/services/apiClient';
import type { UpdateProfilePayload, UserProfile } from '../types/user.types';

export const userService = {
    async getProfile(): Promise<UserProfile> {
        const r = await apiClient.get<UserProfile>('/users/me');
        return r.data;
    },

    async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
        const r = await apiClient.patch<UserProfile>('/users/me', payload);
        return r.data;
    },

    async deleteAccount(): Promise<void> {
        await apiClient.delete('/users/me');
    },
};
