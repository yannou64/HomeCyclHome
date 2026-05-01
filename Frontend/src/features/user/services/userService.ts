import { apiClient } from '../../../shared/services/apiClient';
import type { UpdateProfilePayload, UserProfile } from '../types/user.types';

export const userService = {
    getProfile(): Promise<UserProfile> {
        return apiClient.get<UserProfile>('/users/me').then((r) => r.data);
    },

    updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
        return apiClient.patch<UserProfile>('/users/me', payload).then((r) => r.data);
    },

    deleteAccount(): Promise<void> {
        return apiClient.delete('/users/me').then(() => undefined);
    },
};
