import { useState, useCallback, useEffect } from 'react';
import { adminInterventionsService } from '../services/adminInterventionsService';
import type {
    AdminInterventionListItem,
    ActiveInterventionTab,
    GetAdminInterventionsParams,
} from '../types/adminIntervention.types';
import type { PaginationMeta } from '../../../shared/types/pagination.types';

const TAB_TO_STATUT: Record<ActiveInterventionTab, GetAdminInterventionsParams['statut']> = {
    planifiees: 'Planifiee',
    enRetard: 'enRetard',
    archivees: 'archivees',
};

const LIMIT = 6;

export function useAdminInterventions() {
    const [interventions, setInterventions] = useState<AdminInterventionListItem[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: LIMIT, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTabState] = useState<ActiveInterventionTab>('planifiees');
    const [zoneId, setZoneIdState] = useState<string | undefined>(undefined);
    const [technicienId, setTechnicienIdState] = useState<string | undefined>(undefined);
    const [page, setPage] = useState(1);

    const fetchInterventions = useCallback(
        async (params: GetAdminInterventionsParams) => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await adminInterventionsService.getInterventions(params);
                setInterventions(result.data);
                setMeta(result.meta);
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
            statut: TAB_TO_STATUT[activeTab],
            zoneId,
            technicienId,
            page,
            limit: LIMIT,
        });
    }, [activeTab, zoneId, technicienId, page, fetchInterventions]);

    const setActiveTab = (tab: ActiveInterventionTab) => {
        setActiveTabState(tab);
        setPage(1);
    };
    const setZoneId = (id: string | undefined) => {
        setZoneIdState(id);
        setPage(1);
    };
    const setTechnicienId = (id: string | undefined) => {
        setTechnicienIdState(id);
        setPage(1);
    };

    return {
        interventions,
        meta,
        isLoading,
        error,
        activeTab,
        setActiveTab,
        zoneId,
        setZoneId,
        technicienId,
        setTechnicienId,
        page,
        setPage,
    };
}