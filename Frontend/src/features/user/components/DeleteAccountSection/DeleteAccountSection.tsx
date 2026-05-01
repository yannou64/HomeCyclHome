import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../../../shared/components/ui/dialog';
import { Card } from '../../../../shared/components/Card/Card';
import { useDeleteAccount } from '../../hooks/useDeleteAccount';
import styles from './DeleteAccountSection.module.scss';

export function DeleteAccountSection() {
    const [isOpen, setIsOpen] = useState(false);
    const { handleDeleteAccount, isLoading, error } = useDeleteAccount();

    const handleConfirm = async () => {
        await handleDeleteAccount();
    };

    return (
        <>
            <Card className={styles.card}>
                <h2 className={styles.title}>Suppression de compte</h2>
                <p className={styles.description}>
                    La suppression de votre compte est irréversible. Tous vos
                    vélos enregistrés seront également supprimés.
                </p>
                <button
                    className={styles.deleteButton}
                    onClick={() => setIsOpen(true)}
                >
                    Supprimer mon compte
                </button>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className={styles.dialogContent}>
                    <DialogHeader>
                        <DialogTitle className={styles.dialogTitle}>
                            Supprimer votre compte
                        </DialogTitle>
                    </DialogHeader>

                    <p className={styles.dialogMessage}>
                        Cette action est <strong>irréversible</strong>. Votre compte
                        et tous vos vélos enregistrés seront définitivement supprimés.
                    </p>

                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.actions}>
                        <button
                            className={styles.cancelButton}
                            onClick={() => setIsOpen(false)}
                            disabled={isLoading}
                        >
                            Annuler
                        </button>
                        <button
                            className={styles.confirmButton}
                            onClick={handleConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Suppression…' : 'Supprimer mon compte'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
