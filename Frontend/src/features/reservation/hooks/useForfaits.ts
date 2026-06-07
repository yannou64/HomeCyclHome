import { useEffect, useState } from 'react';
import { reservationService } from '../services/reservationService';
import type { ForfaitDto } from '../types/forfait.types';

export function useForfaits() {
    const [forfaits, setForfaits] = useState<ForfaitDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetch() {
            try {
                const data = await reservationService.getForfaits();
                setForfaits(data);
            } catch {
                setError('Impossible de charger les forfaits.');
            } finally {
                setIsLoading(false);
            }
        }
        void fetch();
    }, []);

    return { forfaits, isLoading, error };
}
