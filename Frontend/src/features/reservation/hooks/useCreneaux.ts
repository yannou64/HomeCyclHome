import { useCallback } from 'react';
import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { reservationService } from '../services/reservationService';
import type { CreneauDisponible } from '../types/creneau.types';

export function useCreneaux(zoneId: string, dureeMinutes: number) {
    // Le loader dépend de la zone et de la durée : recréé (donc rechargé)
    // quand l'une des deux change. Fenêtre : aujourd'hui + 28 jours.
    const loadCreneaux = useCallback(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const in28Days = new Date(today);
        in28Days.setDate(today.getDate() + 28);
        in28Days.setHours(23, 59, 59, 999);

        return reservationService.getCreneaux({
            zoneId,
            dureeMinutes,
            dateDebut: today.toISOString(),
            dateFin: in28Days.toISOString(),
        });
    }, [zoneId, dureeMinutes]);

    const {
        data: creneaux,
        isLoading,
        error,
    } = useAsyncData<CreneauDisponible[]>(
        loadCreneaux,
        [],
        'Impossible de charger les créneaux disponibles.',
    );

    return { creneaux, isLoading, error };
}
