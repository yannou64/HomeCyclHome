import { useEffect, useState } from 'react';
import { cycleService } from '../../cycle/services/cycleService';
import type { Cycle } from '../../cycle/types/cycle.types';

// Lecture seule des cycles de l'utilisateur pour le tunnel de réservation.
// Contrairement à useCycles (profil), ce hook n'expose pas les actions CRUD.
// Le paramètre enabled permet d'éviter l'appel API quand l'utilisateur n'est pas connecté.
export function useUserCyclesForReservation(enabled: boolean) {
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [isLoading, setIsLoading] = useState(enabled);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return;

        async function fetch() {
            try {
                const data = await cycleService.getAll();
                setCycles(data);
            } catch {
                setError('Impossible de charger vos cycles.');
            } finally {
                setIsLoading(false);
            }
        }
        void fetch();
    }, [enabled]);

    return { cycles, isLoading, error };
}
