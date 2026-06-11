import styles from './RestoreCard.module.scss';
import type { PendingReservationStorage } from '../../../../app/providers/reservationContext/types/reservation.types';

type Props = {
    pendingData: PendingReservationStorage;
    onConfirm: () => void;
    onDecline: () => void;
};

function formatDate(iso: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso));
}

export function RestoreCard({ pendingData, onConfirm, onDecline }: Props) {
    const { forfait, creneau } = pendingData;

    return (
        <div className={styles.container}>
            <div className={styles.icon}>🚲</div>
            <h2 className={styles.title}>Reprendre votre réservation ?</h2>
            <div className={styles.summary}>
                <span className={styles.summaryItem}>{forfait.nom}</span>
                <span className={styles.summaryDot}>·</span>
                <span className={styles.summaryItem}>{formatDate(creneau.dateDebut)}</span>
            </div>
            <p className={styles.description}>
                Vous avez commencé une réservation avant de vous connecter.
                Voulez-vous reprendre là où vous en étiez ?
            </p>
            <div className={styles.actions}>
                <button className={styles.btnPrimary} onClick={onConfirm}>
                    Oui, reprendre
                </button>
                <button className={styles.btnSecondary} onClick={onDecline}>
                    Non, recommencer
                </button>
            </div>
        </div>
    );
}
