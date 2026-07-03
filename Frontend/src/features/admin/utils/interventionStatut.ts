import type { AdminInterventionListItem } from '../types/adminIntervention.types';

export type InterventionDisplayStatut = 'Planifiee' | 'EnRetard' | 'Terminee' | 'Annulee';

const STATUT_LABELS: Record<InterventionDisplayStatut, string> = {
    Planifiee: 'Planifiée',
    EnRetard: 'En retard',
    Terminee: 'Terminée',
    Annulee: 'Annulée',
};

// Dérive le statut d'affichage à partir du booléen enRetard calculé côté serveur —
// jamais de recalcul de date côté client (évite tout décalage d'horloge).
export function getDisplayStatut(
    intervention: Pick<AdminInterventionListItem, 'statut' | 'enRetard'>,
): InterventionDisplayStatut {
    if (intervention.statut === 'Planifiee' && intervention.enRetard) {
        return 'EnRetard';
    }
    return intervention.statut;
}

export function getStatutLabel(displayStatut: InterventionDisplayStatut): string {
    return STATUT_LABELS[displayStatut];
}