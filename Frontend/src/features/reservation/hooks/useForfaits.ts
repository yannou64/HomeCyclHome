import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { reservationService } from '../services/reservationService';
import type { ForfaitDto } from '../types/forfait.types';

// Loader défini hors du composant : référence stable, chargé une fois au montage.
const loadForfaits = () => reservationService.getForfaits();

export function useForfaits() {
    const {
        data: forfaits,
        isLoading,
        error,
    } = useAsyncData<ForfaitDto[]>(
        loadForfaits,
        [],
        'Impossible de charger les forfaits.',
    );

    return { forfaits, isLoading, error };
}
