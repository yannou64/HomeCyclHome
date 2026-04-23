import { apiClient } from '../../../shared/services/apiClient';
import type { UpdateProfilePayload, UserProfile } from '../types/user.types';

const isDev = import.meta.env.DEV;

export async function getProfile(): Promise<UserProfile> {
    if (isDev) console.log('[userService] getProfile appelé');
    const response = await apiClient.get<UserProfile>('/users/me');
    if (isDev) console.log('[userService] getProfile réussi :', response.data);
    return response.data;
}

export async function updateProfile(
    payload: UpdateProfilePayload,
): Promise<UserProfile> {
    if (isDev) console.log('[userService] updateProfile appelé :', payload);
    const response = await apiClient.patch<UserProfile>('/users/me', payload);
    if (isDev) console.log('[userService] updateProfile réussi :', response.data);
    return response.data;
}
