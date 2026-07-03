import { useEffect, useReducer } from 'react';
import { adminInterventionsService } from '../services/adminInterventionsService';
import type { AdminInterventionDetail } from '../types/adminIntervention.types';

type FetchState = {
    detail: AdminInterventionDetail | null;
    isLoading: boolean;
    error: string | null;
};

type FetchAction =
    | { type: 'start' }
    | { type: 'success'; payload: AdminInterventionDetail }
    | { type: 'error' };

function fetchReducer(_: FetchState, action: FetchAction): FetchState {
    switch (action.type) {
        case 'start':   return { detail: null, isLoading: true, error: null };
        case 'success': return { detail: action.payload, isLoading: false, error: null };
        case 'error':   return { detail: null, isLoading: false, error: 'Impossible de charger le détail.' };
    }
}

const INITIAL_STATE: FetchState = { detail: null, isLoading: false, error: null };

export function useAdminInterventionDetail(id: string | null) {
    const [state, dispatch] = useReducer(fetchReducer, INITIAL_STATE);

    useEffect(() => {
        if (!id) return;

        let active = true;
        dispatch({ type: 'start' });

        void (async () => {
            try {
                const data = await adminInterventionsService.getInterventionDetail(id);
                if (active) dispatch({ type: 'success', payload: data });
            } catch {
                if (active) dispatch({ type: 'error' });
            }
        })();

        return () => { active = false; };
    }, [id]);

    return state;
}
