import { useState } from 'react';
import { useZonesProposees } from '../../../hooks/useZonesProposees';
import {
    SaisiePlanification,
    type ValeursSaisie,
} from '../SaisiePlanification/SaisiePlanification';
import styles from './PlanificationLibre.module.scss';

interface PlanificationLibreProps {
    technicienId: string;
    onRetour: () => void;
}

// Une planification libre part de zéro : aucune valeur préremplie (CA09)
const SAISIE_VIDE: ValeursSaisie = { zoneId: '', jours: [], blocs: [] };

/**
 * Écran de planification libre (US-01 « Choisir le mode de planification
 * 2.0 ») : la même saisie qu'un modèle, mais vide, sans modèle associé, donc
 * sans titre ni boutons *Modifier le modèle* / *Supprimer le modèle* (RG12).
 * Rien n'est enregistré comme modèle.
 *
 * La période arrive avec l'US-02, *Générer les créneaux* avec l'US-03.
 */
export function PlanificationLibre({
    technicienId,
    onRetour,
}: PlanificationLibreProps) {
    const { zones, zonesError } = useZonesProposees(technicienId);
    const [valeurs, setValeurs] = useState<ValeursSaisie>(SAISIE_VIDE);

    return (
        <div className={styles.wrapper}>
            {/* Règles d'interface : « ← Retour » en haut à gauche */}
            <button type="button" className={styles.retour} onClick={onRetour}>
                ← Retour
            </button>
            <h2 className={styles.titre}>Planification libre</h2>

            <SaisiePlanification
                zones={zones}
                zonesError={zonesError}
                valeurs={valeurs}
                onChange={setValeurs}
            />
        </div>
    );
}
