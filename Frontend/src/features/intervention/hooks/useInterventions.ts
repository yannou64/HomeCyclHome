import { useCallback, useEffect, useState } from 'react';
import { clientInterventionService } from '../services/clientInterventionService';
import type { InterventionClientDto } from '../types/clientIntervention.types';

export function useInterventions() {
    const [interventions, setInterventions] = useState<InterventionClientDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInterventions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await clientInterventionService.getMyInterventions();
            setInterventions(data);
        } catch {
            setError('Impossible de charger vos interventions.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchInterventions();
    }, [fetchInterventions]);

    const cancelIntervention = async (id: string) => {
        await clientInterventionService.cancelIntervention(id);
        await fetchInterventions();
    };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);

    const precedentes = interventions.filter(
        (i) => new Date(i.dateDebut) < todayStart,
    );
    const aujourdhui = interventions.filter((i) => {
        const d = new Date(i.dateDebut);
        return d >= todayStart && d < tomorrowStart;
    });
    const planifiees = interventions.filter(
        (i) => new Date(i.dateDebut) >= tomorrowStart && i.statut === 'Planifiee',
    );

    return {
        precedentes,
        aujourdhui,
        planifiees,
        isLoading,
        error,
        cancelIntervention,
    };
}
