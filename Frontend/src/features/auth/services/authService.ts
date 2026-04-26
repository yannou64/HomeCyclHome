import type { AuthSession } from '../../../app/providers/authContext/types/auth.types';
import { apiClient } from '../../../shared/services/apiClient';
import type { LoginPayload, RegisterPayload } from '../types/auth.types';

export const authService = {
    login(payload: LoginPayload): Promise<AuthSession> {
        return apiClient.post<AuthSession>('/auth/login', payload).then((r) => r.data);
    },

    logout(): Promise<void> {
        return apiClient.post('/auth/logout').then(() => undefined);
    },

    register(payload: RegisterPayload): Promise<void> {
        return apiClient.post('/auth/register', payload).then(() => undefined);
    },
};
