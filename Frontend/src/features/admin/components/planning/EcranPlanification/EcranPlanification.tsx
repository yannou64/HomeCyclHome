import { useEcranPlanification } from '../../../hooks/useEcranPlanification';
import { useModele } from '../../../hooks/useModele';
import { PlanificationForm } from '../PlanificationForm/PlanificationForm';
import styles from './EcranPlanification.module.scss';

interface EcranPlanificationProps {
    technicienId: string;
    // Présent : l'écran s'ouvre prérempli par ce modèle. Absent :
    // planification libre (US-01 « Choisir le mode de planification 2.0 »)
    modeleId?: string;
    onRetour: () => void;
    onSupprimerModele: () => void;
}

/**
 * Charge l'écran de planification (demain, zones proposées) et, pour un
 * modèle, ses valeurs ; puis rend le formulaire. Un seul écran pour la
 * planification libre et pour un modèle (écart du 19/11/2026, option A).
 */
export function EcranPlanification({
    technicienId,
    modeleId,
    onRetour,
    onSupprimerModele,
}: EcranPlanificationProps) {
    const ecranCharge = useEcranPlanification(technicienId);
    const modeleCharge = useModele(technicienId, modeleId);
    const { ecran } = ecranCharge;
    const { modele } = modeleCharge;

    // Tout est prêt : l'écran, et le modèle s'il y en a un
    if (ecran && (modeleId === undefined || modele)) {
        return (
            <PlanificationForm
                technicienId={technicienId}
                ecran={ecran}
                modele={modele ?? undefined}
                onRetour={onRetour}
                onSupprimerModele={onSupprimerModele}
            />
        );
    }

    // Chargement ou échec (technicien ou modèle introuvable…) : la carte,
    // son retour et l'état
    const error = ecranCharge.error ?? modeleCharge.error;
    return (
        <div className={styles.wrapper}>
            <button type="button" className={styles.retour} onClick={onRetour}>
                ← Retour
            </button>
            {error ? (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            ) : (
                <p className={styles.info}>Chargement…</p>
            )}
        </div>
    );
}
