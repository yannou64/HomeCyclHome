import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import { getApiErrorMessage } from '../../../../../shared/utils/apiError';
import styles from './SupprimerModeleDialog.module.scss';

interface SupprimerModeleDialogProps {
    isOpen: boolean;
    onClose: () => void; // « Annuler » : rien n'est supprimé (CA04)
    onConfirm: () => Promise<void>; // « Continuer » : supprime (CA05)
}

/**
 * Fenêtre de confirmation de la suppression d'un modèle (US-03, RG9). La même
 * fenêtre sert depuis l'écran d'un modèle et depuis le lien de suppression
 * d'un modèle invalide dans la liste (CA06).
 */
export function SupprimerModeleDialog({
    isOpen,
    onClose,
    onConfirm,
}: SupprimerModeleDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className={styles.content}>
                <DialogHeader>
                    <DialogTitle className={styles.title}>
                        Supprimer le modèle
                    </DialogTitle>
                    <DialogDescription className={styles.message}>
                        Êtes-vous sûr de vouloir supprimer ce modèle ?
                        <br />
                        La suppression est définitive. Les créneaux déjà générés
                        ne sont pas touchés.
                    </DialogDescription>
                </DialogHeader>

                <SupprimerModeleContenu
                    onConfirm={onConfirm}
                    onClose={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}

interface SupprimerModeleContenuProps {
    onConfirm: () => Promise<void>;
    onClose: () => void;
}

// Rendu dans <DialogContent>, que Radix démonte à la fermeture : l'erreur et
// l'envoi repartent à zéro à chaque ouverture (Frontend/CLAUDE.md, section 5)
function SupprimerModeleContenu({
    onConfirm,
    onClose,
}: SupprimerModeleContenuProps) {
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            await onConfirm(); // le parent recharge la liste et y revient
        } catch (err) {
            // Refus (modèle déjà supprimé dans un autre onglet…) : la fenêtre
            // reste ouverte et affiche le message de l'API
            setError(getApiErrorMessage(err, 'Une erreur est survenue.'));
            setIsDeleting(false);
        }
    };

    return (
        <>
            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.boutonSecondaire}
                    onClick={onClose}
                    disabled={isDeleting}
                >
                    Annuler
                </button>
                <button
                    type="button"
                    className={styles.boutonDanger}
                    onClick={handleConfirm}
                    disabled={isDeleting}
                >
                    {isDeleting ? 'Suppression…' : 'Continuer'}
                </button>
            </div>
        </>
    );
}
