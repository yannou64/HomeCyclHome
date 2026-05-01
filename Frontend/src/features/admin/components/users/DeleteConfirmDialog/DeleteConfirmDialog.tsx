import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import type { AdminUser } from '../../../types/admin.types';
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

    const handleConfirm = async () => {
        await onConfirm();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={styles.content}>
                <DialogHeader>
                    <DialogTitle className={styles.title}>
                        Supprimer l&apos;utilisateur
                    </DialogTitle>
                </DialogHeader>

                <p className={styles.message}>
                    Êtes-vous sûr de vouloir supprimer{' '}
                    <strong>{user.prenom} {user.nom}</strong> ?
                    <br />
                    Cette action est irréversible.
                </p>

                <div className={styles.actions}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Annuler
                    </button>
                    <button className={styles.confirmButton} onClick={handleConfirm}>
                        Supprimer
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
