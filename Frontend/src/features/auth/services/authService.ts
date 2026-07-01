import type { AuthSession } from '../../../app/providers/authContext/types/auth.types';
import { apiClient } from '../../../shared/services/apiClient';
import type { LoginPayload, RegisterPayload } from '../types/auth.types';

export const authService = {
    async login(payload: LoginPayload): Promise<AuthSession> {
        const r = await apiClient.post<AuthSession>('/auth/login', payload);
        return r.data;
    },

    async logout(): Promise<void> {
        await apiClient.post('/auth/logout');
    },

    async register(payload: RegisterPayload): Promise<void> {
        await apiClient.post('/auth/register', payload);
    },

    async confirmEmail(token: string): Promise<void> {
        await apiClient.get('/auth/confirm-email', { params: { token } });
    },
};
