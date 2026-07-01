import { useState } from 'react';
import axios from 'axios';
import { authService } from '../services/authService';
import type { RegisterPayload } from '../types/auth.types';

export function useRegister() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    async function handleRegister(payload: RegisterPayload) {
        setIsLoading(true);
        setError(null);
        try {
            await authService.register(payload);
            setIsSuccess(true);
        } catch (e) {
            if (axios.isAxiosError(e) && e.response?.status === 409) {
                setError('Cet email est déjà utilisé.');
            } else {
                setError('Une erreur est survenue. Réessaie.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return { handleRegister, isLoading, error, isSuccess };
}
