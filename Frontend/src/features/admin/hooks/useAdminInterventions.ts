import { useCallback, useState } from 'react';
import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminInterventionsService } from '../services/adminInterventionsService';
import type {
    ActiveInterventionTab,
    GetAdminInterventionsParams,
    PaginatedAdminInterventions,
} from '../types/adminIntervention.types';

const TAB_TO_STATUT: Record<ActiveInterventionTab, GetAdminInterventionsParams['statut']> = {
    planifiees: 'Planifiee',
    enRetard: 'enRetard',
    archivees: 'archivees',
};

const LIMIT = 6;

// Page vide affichée avant la première réponse.
const EMPTY_PAGE: PaginatedAdminInterventions = {
    data: [],
    meta: { total: 0, page: 1, limit: LIMIT, totalPages: 1 },
};

export function useAdminInterventions() {
    const [activeTab, setActiveTabState] = useState<ActiveInterventionTab>('planifiees');
    const [zoneId, setZoneIdState] = useState<string | undefined>(undefined);
    const [technicienId, setTechnicienIdState] = useState<string | undefined>(undefined);
    const [page, setPage] = useState(1);

    // Le loader dépend de l'onglet, des filtres et de la page : useCallback ne
    // le recrée que lorsqu'ils changent, ce qui déclenche un rechargement.
    const loadInterventions = useCallback(
        () =>
            adminInterventionsService.getInterventions({
                statut: TAB_TO_STATUT[activeTab],
                zoneId,
                technicienId,
                page,
                limit: LIMIT,
            }),
        [activeTab, zoneId, technicienId, page],
    );
    const { data, isLoading, error } = useAsyncData(
        loadInterventions,
        EMPTY_PAGE,
        'Impossible de charger les interventions.',
    );
    const { data: interventions, meta } = data;

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