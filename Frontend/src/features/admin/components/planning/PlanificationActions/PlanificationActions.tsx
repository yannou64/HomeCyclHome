import styles from './PlanificationActions.module.scss';

interface PlanificationActionsProps {
    isSubmitting: boolean;
    onModifierModele: () => void;
    onSupprimerModele: () => void;
}

/**
 * Bas de l'écran de planification d'un modèle (disposition choisie par
 * Yannick le 23/11/2026) :
 * - « Supprimer le modèle », action destructrice, à l'écart à gauche ;
 * - « Modifier le modèle », bouton secondaire, à droite ;
 * - « Générer les créneaux », bouton principal tout à droite, arrive avec
 *   l'US-03.
 * Pas de bouton « Annuler » : « ← Retour » en haut de l'écran suffit.
 */
export function PlanificationActions({
    isSubmitting,
    onModifierModele,
    onSupprimerModele,
}: PlanificationActionsProps) {
    return (
        <div className={styles.actions}>
            <button
                type="button"
                className={styles.boutonSupprimer}
                onClick={onSupprimerModele}
                disabled={isSubmitting}
            >
                Supprimer le modèle
            </button>
            <button
                type="button"
                className={styles.boutonSecondaire}
                onClick={onModifierModele}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Enregistrement…' : 'Modifier le modèle'}
            </button>
        </div>
    );
}
