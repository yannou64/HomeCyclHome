import { useState, useCallback, useEffect } from 'react';
import { adminInterventionsService } from '../services/adminInterventionsService';
import type {
    AdminInterventionListItem,
    ActiveInterventionTab,
} from '../types/adminIntervention.types';

export function useAdminInterventions() {
    const [interventions, setInterventions] = useState<AdminInterventionListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveInterventionTab>('planifiees');
    const [zoneId, setZoneId] = useState<string | undefined>(undefined);
    const [technicienId, setTechnicienId] = useState<string | undefined>(undefined);

    const fetchInterventions = useCallback(
        async (params: {
            statut: 'Planifiee' | 'archivees';
            zoneId?: string;
            technicienId?: string;
        }) => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await adminInterventionsService.getInterventions(params);
                setInterventions(data);
            } catch {
                setError('Impossible de charger les interventions.');
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        void fetchInterventions({
            statut: activeTab === 'planifiees' ? 'Planifiee' : 'archivees',
            zoneId,
            technicienId,
        });
    }, [activeTab, zoneId, technicienId, fetchInterventions]);

    return {
        interventions,
        isLoading,
        error,
        activeTab,
        setActiveTab,
        zoneId,
        setZoneId,
        technicienId,
        setTechnicienId,
    };
}
