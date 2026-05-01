import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/authContext/useAuth';
import { userService } from '../services/userService';

export function useDeleteAccount() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { logout } = useAuth();
    const navigate = useNavigate();

    async function handleDeleteAccount() {
        setIsLoading(true);
        setError(null);

        try {
            await userService.deleteAccount();
            // Nettoie la session locale puis redirige vers l'accueil
            logout();
            navigate('/');
        } catch {
            setError('Une erreur est survenue. Réessaie.');
            setIsLoading(false);
        }
    }

    return { handleDeleteAccount, isLoading, error };
}
