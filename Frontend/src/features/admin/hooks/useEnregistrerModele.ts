import { useCallback, useState } from 'react';
import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { adminPlanningService } from '../services/adminPlanningService';
import type {
    CreateModelePayload,
    ZoneProposee,
} from '../types/planning.types';

/**
 * Formulaire d'un modèle : charge les zones proposées (affectées au
 * technicien et actives) et enregistre la saisie. Sans `modeleId`, c'est une
 * création ; avec, une modification, enregistrée sans confirmation (RG8).
 */
export function useEnregistrerModele(technicienId: string, modeleId?: string) {
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

    /** Renvoie true si le modèle est enregistré. */
    async function enregistrer(payload: CreateModelePayload): Promise<boolean> {
        setIsSubmitting(true);
        setError(null);
        try {
            if (modeleId) {
                await adminPlanningService.updateModele(
                    technicienId,
                    modeleId,
                    payload,
                );
            } else {
                await adminPlanningService.createModele(technicienId, payload);
            }
            return true;
        } catch (err) {
            // Refus du serveur (intitulé déjà pris, zone invalide, modèle
            // devenu invalide…) : son message
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
        enregistrer,
        isSubmitting,
        error,
        setError,
    };
}
