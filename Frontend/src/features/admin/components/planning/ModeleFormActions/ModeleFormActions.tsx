import styles from './ModeleFormActions.module.scss';

interface ModeleFormActionsProps {
    enModification: boolean;
    isSubmitting: boolean;
    onAnnuler: () => void;
}

/**
 * Bas du formulaire d'un modèle : « Annuler » (abandonner la saisie), puis le
 * bouton qui envoie le formulaire, « Créer le modèle » ou « Modifier le
 * modèle » selon le mode.
 */
export function ModeleFormActions({
    enModification,
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
                {libelleBouton(enModification, isSubmitting)}
            </button>
        </div>
    );
}

/** Libellé du bouton principal, selon le mode et l'envoi en cours. */
function libelleBouton(enModification: boolean, isSubmitting: boolean) {
    if (enModification) {
        return isSubmitting ? 'Enregistrement…' : 'Modifier le modèle';
    }
    return isSubmitting ? 'Création…' : 'Créer le modèle';
}
