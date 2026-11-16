import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import type { AdminUser } from '../../../types/admin.types';
import { getApiErrorMessage } from '../../../../../shared/utils/apiError';
import styles from './DeleteConfirmDialog.module.scss';

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    user: AdminUser | null;
}

export function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    user,
}: DeleteConfirmDialogProps) {
    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={styles.content}>
                <DialogHeader>
                    <DialogTitle className={styles.title}>
                        Supprimer l&apos;utilisateur
                    </DialogTitle>
                </DialogHeader>

                <DeleteConfirmContent
                    user={user}
                    onConfirm={onConfirm}
                    onClose={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}

interface DeleteConfirmContentProps {
    user: AdminUser;
    onConfirm: () => Promise<void>;
    onClose: () => void;
}

// Contenu du dialogue, rendu à l'intérieur de <DialogContent>, que Radix démonte
// à la fermeture : l'erreur repart donc à null à chaque ouverture, sans remise à
// zéro manuelle (même principe que ForfaitFormDialog).
function DeleteConfirmContent({
    user,
    onConfirm,
    onClose,
}: DeleteConfirmContentProps) {
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        try {
            await onConfirm();
            onClose(); // succès : la liste est rechargée, la boîte se ferme
        } catch (err) {
            // Refus (409 compte lié à des interventions…) : la boîte reste
            // ouverte et affiche le message renvoyé par l'API
            setError(getApiErrorMessage(err, 'Une erreur est survenue.'));
        }
    };

    return (
        <>
            <p className={styles.message}>
                Êtes-vous sûr de vouloir supprimer{' '}
                <strong>
                    {user.prenom} {user.nom}
                </strong>{' '}
                ?
                <br />
                Cette action est irréversible.
            </p>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
                <button className={styles.cancelButton} onClick={onClose}>
                    Annuler
                </button>
                <button
                    className={styles.confirmButton}
                    onClick={handleConfirm}
                >
                    Supprimer
                </button>
            </div>
        </>
    );
}
