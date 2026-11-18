import { useCallback, useState } from 'react';
import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { adminPlanningService } from '../services/adminPlanningService';
import type {
    CreateModelePayload,
    ZoneProposee,
} from '../types/planning.types';

/**
 * Formulaire de création d'un modèle : charge les zones proposées (affectées
 * au technicien et actives) et envoie la création.
 */
export function useCreerModele(technicienId: string) {
    const loadZones = useCallback(
        () => adminPlanningService.getZonesProposees(technicienId),
        [technicienId],
    );
    const {
        data: zones,
        isLoading: isLoadingZones,
        error: zonesError,
    } = useAsyncData<ZoneProposee[]>(
        loadZones,
        [],
        'Impossible de charger les zones du technicien.',
    );

    // Action déclenchée par l'utilisateur : état local modifié dans la fonction
    // appelée par l'événement (Frontend/CLAUDE.md, section 5)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /** Renvoie true si le modèle est créé. */
    async function creer(payload: CreateModelePayload): Promise<boolean> {
        setIsSubmitting(true);
        setError(null);
        try {
            await adminPlanningService.createModele(technicienId, payload);
            return true;
        } catch (err) {
            // Refus du serveur (intitulé déjà pris, zone invalide…) : son message
            setError(getApiErrorMessage(err, 'Une erreur est survenue.'));
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }

    return {
        zones,
        isLoadingZones,
        zonesError,
        creer,
        isSubmitting,
        error,
        setError,
    };
}
