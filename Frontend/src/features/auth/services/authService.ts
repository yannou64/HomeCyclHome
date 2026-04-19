import type { AuthSession } from '../../../app/providers/authContext/types/auth.types';
import { apiClient } from '../../../shared/services/apiClient';
import type { LoginPayload, RegisterPayload } from '../types/auth.types';


const isDev = import.meta.env.DEV;

export async function login(payload: LoginPayload): Promise<AuthSession> {
    if (isDev) console.log('[authService] login appelé avec : ', payload.email);

    const response = await apiClient.post<AuthSession>('/auth/login', payload);
    if (isDev) console.log('[authService] login réussi : ', response.data)

    return response.data;
}

export async function logout(): Promise<void> {
    if (isDev) console.log('[authService] logout appelé')
    await apiClient.post('/auth/logout');
}

export async function register(payload: RegisterPayload): Promise<void> {
    if (isDev) console.log('[authService] register appelé avec : ', payload.email);
    await apiClient.post('/auth/register', payload);
}