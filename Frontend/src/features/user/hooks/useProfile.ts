import { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import type { UserProfile } from '../types/user.types';

export function useProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const data = await userService.getProfile();
                setProfile(data);
            } catch {
                setError('Impossible de charger le profil.');
            } finally {
                setIsLoading(false);
            }
        }

        void fetchProfile();
    }, []); // tableau vide = exécution unique au montage du composant

    return { profile, isLoading, error };
}
