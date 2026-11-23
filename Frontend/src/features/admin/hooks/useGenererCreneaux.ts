import { useState } from 'react';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { adminPlanningService } from '../services/adminPlanningService';
import type {
    ApercuPlanification,
    PlanifierPayload,
    ResultatPlanification,
} from '../types/planning.types';

/** Avertissement en attente : les nombres, et la saisie à confirmer. */
export type Avertissement = ApercuPlanification & { saisie: PlanifierPayload };

/**
 * « Générer les créneaux » en deux temps (séquence de l'US-03) :
 * 1. `demander` : l'aperçu valide la saisie et compte ce qu'elle remplace.
 *    Période vide → génération immédiate, sans avertissement (CA03).
 *    Sinon → `avertissement` est rempli, la page ouvre la fenêtre (CA04).
 * 2. `confirmer` : génération avec `confirmation` (CA06) ; `annuler` ferme
 *    la fenêtre sans aucune requête (CA05).
 */
export function useGenererCreneaux(technicienId: string) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avertissement, setAvertissement] = useState<Avertissement | null>(
        null,
    );

    /** Renvoie le résultat si les créneaux sont générés tout de suite. */
    async function demander(
        saisie: PlanifierPayload,
    ): Promise<ResultatPlanification | null> {
        setIsSubmitting(true);
        setError(null);
        try {
            const apercu = await adminPlanningService.apercuPlanification(
                technicienId,
                saisie,
            );
            if (apercu.creneauxSupprimes > 0) {
                setAvertissement({ ...apercu, saisie });
                return null;
            }
            return await adminPlanningService.planifier(technicienId, saisie);
        } catch (err) {
            // Saisie refusée par le serveur : son message
            setError(getApiErrorMessage(err, 'Une erreur est survenue.'));
            return null;
        } finally {
            setIsSubmitting(false);
        }
    }

    /**
     * Génère en confirmant. Une erreur remonte à la fenêtre, qui l'affiche
     * et reste ouverte (même usage que la fenêtre de suppression).
     */
    async function confirmer(): Promise<ResultatPlanification> {
        if (!avertissement) throw new Error('Aucun avertissement en attente.');
        const resultat = await adminPlanningService.planifier(technicienId, {
            ...avertissement.saisie,
            confirmation: true,
        });
        setAvertissement(null);
        return resultat;
    }

    const annuler = () => setAvertissement(null);

    return {
        demander,
        confirmer,
        annuler,
        avertissement,
        isSubmitting,
        error,
        setError,
    };
}
