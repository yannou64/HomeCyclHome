import type {
    BlocFrise,
    VarianteBloc,
} from '../components/planning/FriseJournee/FriseJournee';
import type { CreneauJournee, StatutCreneau } from '../types/planning.types';

// RG1 de l'épique : un créneau dure toujours 30 minutes
const DUREE_CRENEAU = 30;

// Statut d'un créneau → apparence sur la frise (trois effets distincts)
const VARIANTE: Record<StatutCreneau, VarianteBloc> = {
    Libre: 'libre',
    Deplacement: 'deplacement',
    InterventionReservee: 'reservee',
};

/**
 * Créneaux d'une journée → blocs de la frise 7h–20h, un bloc de 30 min par
 * créneau, selon son statut. Partagé par la carte d'un technicien (page de
 * couverture) et par la journée de la page d'un technicien.
 */
export function blocsDesCreneaux(creneaux: CreneauJournee[]): BlocFrise[] {
    return creneaux.map((c) => ({
        debut: c.debut,
        fin: c.debut + DUREE_CRENEAU,
        variante: VARIANTE[c.statut],
    }));
}
