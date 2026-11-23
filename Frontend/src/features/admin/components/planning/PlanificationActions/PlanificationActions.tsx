import styles from './PlanificationActions.module.scss';

interface PlanificationActionsProps {
    isSubmitting: boolean;
    onGenerer: () => void;
    // Écran d'un modèle seulement : absents en planification libre (CA09 de
    // l'US-01)
    onModifierModele?: () => void;
    onSupprimerModele?: () => void;
}

/**
 * Bas de l'écran de planification (disposition choisie par Yannick le
 * 23/11/2026) :
 * - « Supprimer le modèle », action destructrice, à l'écart à gauche ;
 * - « Modifier le modèle », bouton secondaire ;
 * - « Générer les créneaux », bouton principal tout à droite.
 * Pas de bouton « Annuler » : « ← Retour » en haut de l'écran suffit.
 */
export function PlanificationActions({
    isSubmitting,
    onGenerer,
    onModifierModele,
    onSupprimerModele,
}: PlanificationActionsProps) {
    return (
        <div className={styles.actions}>
            {onSupprimerModele && (
                <button
                    type="button"
                    className={styles.boutonSupprimer}
                    onClick={onSupprimerModele}
                    disabled={isSubmitting}
                >
                    Supprimer le modèle
                </button>
            )}
            {onModifierModele && (
                <button
                    type="button"
                    className={styles.boutonSecondaire}
                    onClick={onModifierModele}
                    disabled={isSubmitting}
                >
                    Modifier le modèle
                </button>
            )}
            <button
                type="button"
                className={styles.boutonPrincipal}
                onClick={onGenerer}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Patientez…' : 'Générer les créneaux'}
            </button>
        </div>
    );
}
