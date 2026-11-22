import { useModele } from '../../../hooks/useModele';
import { ModeleForm } from '../ModeleForm/ModeleForm';
import styles from './ModeleEdition.module.scss';

interface ModeleEditionProps {
    technicienId: string;
    modeleId: string;
    onEnregistre: () => void; // retour à la liste des modèles, rechargée
    onRetour: () => void;
    onSupprimer: () => void; // ouvre la confirmation de suppression (US-03)
}

/**
 * Écran d'un modèle (US-02 « Modifier un modèle de planification 2.0 ») :
 * charge le modèle, puis affiche le formulaire prérempli avec ses valeurs
 * actuelles. Le formulaire n'est rendu qu'une fois le modèle chargé, pour
 * qu'il s'initialise avec ces valeurs.
 */
export function ModeleEdition({
    technicienId,
    modeleId,
    onEnregistre,
    onRetour,
    onSupprimer,
}: ModeleEditionProps) {
    const { modele, isLoading, error } = useModele(technicienId, modeleId);

    if (modele) {
        return (
            <ModeleForm
                technicienId={technicienId}
                modele={modele}
                onEnregistre={onEnregistre}
                onRetour={onRetour}
                onSupprimer={onSupprimer}
            />
        );
    }

    // Chargement ou échec (modèle introuvable…) : la carte, son retour, l'état
    return (
        <div className={styles.wrapper}>
            <button type="button" className={styles.retour} onClick={onRetour}>
                ← Retour
            </button>
            {isLoading && <p className={styles.info}>Chargement…</p>}
            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
