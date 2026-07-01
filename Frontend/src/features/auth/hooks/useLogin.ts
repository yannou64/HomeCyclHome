import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/authContext/useAuth';
import { authService } from '../services/authService';
import type { LoginPayload } from '../types/auth.types';

export function useLogin() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleLogin(payload: LoginPayload) {
        setIsLoading(true);
        setError(null);

        try {
            const session = await authService.login(payload);
            login(session); // met à jour le contexte + localStorage
            navigate('/'); // redirige vers l'accueil
        } catch {
            setError('Email ou mot de passe incorrect.');
        } finally {
            setIsLoading(false); // toujours exécuté, succès ou échec
        }
    }

    return { handleLogin, isLoading, error };
}
