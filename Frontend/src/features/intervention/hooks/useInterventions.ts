import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { clientInterventionService } from '../services/clientInterventionService';
import type { InterventionClient } from '../types/clientIntervention.types';

// Loader défini hors du composant : référence stable, la liste n'est
// chargée qu'au montage puis à chaque reload().
const loadInterventions = () => clientInterventionService.getMyInterventions();

export function useInterventions() {
    const {
        data: interventions,
        isLoading,
        error,
        reload,
    } = useAsyncData<InterventionClient[]>(
        loadInterventions,
        [],
        'Impossible de charger vos interventions.',
    );

    const cancelIntervention = async (id: string) => {
        await clientInterventionService.cancelIntervention(id);
        reload();
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
        (i) =>
            new Date(i.dateDebut) >= tomorrowStart && i.statut === 'Planifiee',
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
