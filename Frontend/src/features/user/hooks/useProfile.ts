import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { userService } from '../services/userService';
import type { UserProfile } from '../types/user.types';

// Loader défini hors du composant : référence stable, chargé une fois au montage.
const loadProfile = (): Promise<UserProfile | null> => userService.getProfile();

export function useProfile() {
    const {
        data: profile,
        isLoading,
        error,
    } = useAsyncData(loadProfile, null, 'Impossible de charger le profil.');

    return { profile, isLoading, error };
}
