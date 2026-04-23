import { useState } from 'react';
import { useAuth } from '../../../app/providers/authContext/useAuth';
import { updateProfile } from '../services/userService';
import type { UpdateProfilePayload } from '../types/user.types';

export function useUpdateProfile() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const { session, login } = useAuth();

    async function handleUpdateProfile(payload: UpdateProfilePayload) {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        try {
            const updated = await updateProfile(payload);

            // Synchronise le Header si le prénom a changé
            if (session) {
                login({ ...session, prenom: updated.prenom });
            }

            setIsSuccess(true);
        } catch {
            setError('Une erreur est survenue. Réessaie.');
        } finally {
            setIsLoading(false);
        }
    }

    return { handleUpdateProfile, isLoading, error, isSuccess };
}
