import styles from './ModeleFormActions.module.scss';

interface ModeleFormActionsProps {
    isSubmitting: boolean;
    onAnnuler: () => void;
}

/**
 * Bas du formulaire de création d'un modèle : « Annuler » (abandonner la
 * saisie), juste à gauche de « Créer le modèle » (règles d'interface).
 *
 * Les boutons d'un modèle existant (« Modifier le modèle », « Supprimer le
 * modèle ») sont sur l'écran de planification : PlanificationActions.
 */
export function ModeleFormActions({
    isSubmitting,
    onAnnuler,
}: ModeleFormActionsProps) {
    return (
        <div className={styles.actions}>
            <button
                type="button"
                className={styles.boutonSecondaire}
                onClick={onAnnuler}
                disabled={isSubmitting}
            >
                Annuler
            </button>
            <button
                type="submit"
                className={styles.boutonPrincipal}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Création…' : 'Créer le modèle'}
            </button>
        </div>
    );
}
