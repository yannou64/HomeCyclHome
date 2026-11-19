import { useCallback } from 'react';
import { adminPlanningService } from '../services/adminPlanningService';

/**
 * Suppression d'un modèle, appelée par la fenêtre de confirmation (US-03).
 * La fenêtre gère elle-même l'envoi et l'erreur, comme DeleteConfirmDialog :
 * la promesse rejetée lui apporte le message de l'API.
 */
export function useSupprimerModele(technicienId: string) {
    const supprimer = useCallback(
        (modeleId: string) =>
            adminPlanningService.deleteModele(technicienId, modeleId),
        [technicienId],
    );
    return { supprimer };
}
