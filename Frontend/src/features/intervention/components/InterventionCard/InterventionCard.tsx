import type { InterventionClientDto } from '../../types/clientIntervention.types';
import styles from './InterventionCard.module.scss';

interface InterventionCardProps {
    intervention: InterventionClientDto;
    onCancel?: () => void;
}

const STATUT_LABELS: Record<InterventionClientDto['statut'], string> = {
    Planifiee: 'Planifiée',
    Terminee: 'Terminée',
    Annulee: 'Annulée',
};

function getEffectiveStatut(
    statut: InterventionClientDto['statut'],
    dateDebut: string,
): { label: string; key: string } {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (statut === 'Planifiee' && new Date(dateDebut) < todayStart) {
        return { label: 'Passée', key: 'Passee' };
    }
    return { label: STATUT_LABELS[statut], key: statut };
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function InterventionCard({ intervention, onCancel }: InterventionCardProps) {
    const { statut, dateDebut, forfaitNom, dureeMinutesSnapshot, adresse, cycle, commentaire } =
        intervention;

    const adresseFormatee = `${adresse.numero ? adresse.numero + ' ' : ''}${adresse.rue}, ${adresse.codePostal} ${adresse.ville}`;
    const effectiveStatut = getEffectiveStatut(statut, dateDebut);

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.dateBlock}>
                    <span className={styles.date}>{formatDate(dateDebut)}</span>
                    <span className={styles.time}>{formatTime(dateDebut)}</span>
                </div>
                <span className={`${styles.badge} ${styles[`badge${effectiveStatut.key}`]}`}>
                    {effectiveStatut.label}
                </span>
            </div>

            <div className={styles.body}>
                <div className={styles.row}>
                    <span className={styles.label}>Forfait</span>
                    <span className={styles.value}>
                        {forfaitNom} — {dureeMinutesSnapshot} min
                    </span>
                </div>
                <div className={styles.row}>
                    <span className={styles.label}>Adresse</span>
                    <span className={styles.value}>{adresseFormatee}</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.label}>Vélo</span>
                    <span className={styles.value}>
                        {cycle.libelle} · {cycle.marque} · {cycle.type}
                    </span>
                </div>
                {commentaire && (
                    <div className={styles.row}>
                        <span className={styles.label}>Commentaire</span>
                        <span className={styles.value}>{commentaire}</span>
                    </div>
                )}
            </div>

            {onCancel && (
                <div className={styles.footer}>
                    <button className={styles.cancelButton} onClick={onCancel}>
                        Annuler l&apos;intervention
                    </button>
                </div>
            )}
        </div>
    );
}
