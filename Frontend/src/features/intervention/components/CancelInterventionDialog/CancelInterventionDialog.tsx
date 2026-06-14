import type { InterventionClientDto } from '../../types/clientIntervention.types';
import styles from './CancelInterventionDialog.module.scss';

interface CancelInterventionDialogProps {
    intervention: InterventionClientDto | null;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export function CancelInterventionDialog({
    intervention,
    onClose,
    onConfirm,
}: CancelInterventionDialogProps) {
    if (!intervention) return null;

    const dateFormatee = new Date(intervention.dateDebut).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const handleConfirm = async () => {
        await onConfirm();
        onClose();
    };

    return (
        <>
            <div className={styles.overlay} onClick={onClose} aria-hidden="true" />

            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cancel-dialog-title"
            >
                <h2 id="cancel-dialog-title" className={styles.title}>
                    Annuler l&apos;intervention
                </h2>

                <p className={styles.message}>
                    Êtes-vous sûr de vouloir annuler l&apos;intervention du{' '}
                    <strong>{dateFormatee}</strong> ?
                    <br />
                    Cette action est <strong>irréversible</strong>. Le créneau sera libéré.
                </p>

                <div className={styles.actions}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Retour
                    </button>
                    <button className={styles.confirmButton} onClick={handleConfirm}>
                        Confirmer l&apos;annulation
                    </button>
                </div>
            </div>
        </>
    );
}
