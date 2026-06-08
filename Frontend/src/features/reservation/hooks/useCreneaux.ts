import { useEffect, useState } from 'react';
import { reservationService } from '../services/reservationService';
import type { CreneauDisponibleDto } from '../types/creneau.types';

export function useCreneaux(zoneId: string, dureeMinutes: number) {
    const [creneaux, setCreneaux] = useState<CreneauDisponibleDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetch() {
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const in28Days = new Date(today);
                in28Days.setDate(today.getDate() + 28);
                in28Days.setHours(23, 59, 59, 999);

                const data = await reservationService.getCreneaux({
                    zoneId,
                    dureeMinutes,
                    dateDebut: today.toISOString(),
                    dateFin: in28Days.toISOString(),
                });
                setCreneaux(data);
            } catch {
                setError('Impossible de charger les créneaux disponibles.');
            } finally {
                setIsLoading(false);
            }
        }
        void fetch();
    }, [zoneId, dureeMinutes]);

    return { creneaux, isLoading, error };
}
