import { useState } from 'react';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { adminPlanningService } from '../services/adminPlanningService';
import type { CreateModelePayload } from '../types/planning.types';

/**
 * Enregistre un modèle. Sans `modeleId`, c'est une création (formulaire d'un
 * nouveau modèle) ; avec, une modification par « Modifier le modèle » depuis
 * l'écran de planification, enregistrée sans confirmation (RG12).
 *
 * Les zones proposées ne sont pas chargées ici : chaque écran les charge
 * (useZonesProposees pour la création, useEcranPlanification sinon).
 */
export function useEnregistrerModele(technicienId: string, modeleId?: string) {
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

    return { enregistrer, isSubmitting, error, setError };
}
