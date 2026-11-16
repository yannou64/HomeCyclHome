import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { cycleService } from '../../cycle/services/cycleService';
import type { Cycle } from '../../cycle/types/cycle.types';

// Loader défini hors du composant : référence stable.
const loadCycles = () => cycleService.getAll();

// Lecture seule des cycles de l'utilisateur pour le tunnel de réservation.
// Contrairement à useCycles (profil), ce hook n'expose pas les actions CRUD.
// enabled évite l'appel API quand l'utilisateur n'est pas connecté.
export function useUserCyclesForReservation(enabled: boolean) {
    const {
        data: cycles,
        isLoading,
        error,
    } = useAsyncData<Cycle[]>(
        loadCycles,
        [],
        'Impossible de charger vos cycles.',
        { enabled },
    );

    return { cycles, isLoading, error };
}
