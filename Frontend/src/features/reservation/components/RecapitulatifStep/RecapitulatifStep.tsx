import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservation } from '../../../../app/providers/reservationContext/useReservation';
import {
    PENDING_RESERVATION_KEY,
    type ForfaitInfo,
    type CreneauInfo,
} from '../../../../app/providers/reservationContext/types/reservation.types';
import { useCreateIntervention } from '../../hooks/useCreateIntervention';
import { CommentaireEtPhotosForm } from '../CommentaireEtPhotosForm/CommentaireEtPhotosForm';
import { CTAButton } from '../../../../shared/components/CTAButton/CTAButton';
import styles from './RecapitulatifStep.module.scss';

type ConfirmationData = {
    forfait: ForfaitInfo;
    creneau: CreneauInfo;
    adresseLabel: string;
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDuree(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h${m}`;
}

export function RecapitulatifStep() {
    const { adresse, cycle, forfait, creneau, commentaire, reset, goToStep } = useReservation();
    const { createIntervention, isLoading, error } = useCreateIntervention();
    const navigate = useNavigate();

    const [showCommentForm, setShowCommentForm] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);

    const handleSubmit = async () => {
        if (!adresse || !cycle || !forfait || !creneau) return;

        const snapshot: ConfirmationData = {
            forfait,
            creneau,
            adresseLabel: `${adresse.data.rue}, ${adresse.data.ville}`,
        };

        try {
            await createIntervention({
                adresse,
                cycle,
                forfaitId: forfait.forfaitId,
                creneauId: creneau.creneauId,
                commentaire: commentaire?.commentaire || undefined,
            });
            localStorage.removeItem(PENDING_RESERVATION_KEY);
            // reset() est volontairement déplacé dans le bouton "Retour à l'accueil"
            // — l'appeler ici changerait currentStep et démonterait ce composant
            // avant que l'écran de succès ne soit affiché.
            setConfirmationData(snapshot);
            setIsSuccess(true);
        } catch {
            // error est exposé par useCreateIntervention
        }
    };

    if (isSuccess && confirmationData) {
        const { forfait: f, creneau: c, adresseLabel } = confirmationData;
        return (
            <div className={styles.successContainer}>
                <div className={styles.successIcon}>✓</div>
                <h2 className={styles.successTitle}>Intervention confirmée !</h2>
                <p className={styles.successText}>
                    Votre demande a bien été enregistrée.
                    Un email de confirmation vous a été envoyé.
                </p>

                <div className={styles.summaryCard}>
                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Date</span>
                        <span className={styles.summaryValue}>{formatDate(c.dateDebut)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Horaire</span>
                        <span className={styles.summaryValue}>
                            {formatTime(c.dateDebut)} → {formatTime(c.dateFin)}
                        </span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Forfait</span>
                        <span className={styles.summaryValue}>
                            {f.nom}
                            <span className={styles.summaryMeta}>
                                {formatDuree(f.dureeMinutes)}
                                {f.prix !== null && ` · ${f.prix.toFixed(2)} €`}
                            </span>
                        </span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Adresse</span>
                        <span className={styles.summaryValue}>{adresseLabel}</span>
                    </div>
                </div>

                <CTAButton onClick={() => { reset(); navigate('/'); }}>
                    Retour à l'accueil
                </CTAButton>
            </div>
        );
    }

    if (!adresse || !cycle || !forfait || !creneau) return null;

    const adresseLabel =
        adresse.source === 'saved'
            ? `${adresse.data.rue}, ${adresse.data.ville}`
            : `${adresse.data.rue}, ${adresse.data.ville}`;

    const cycleLabel = `${adresse.source === 'saved' ? '' : ''}${cycle.marqueLibelle} — ${cycle.typeCycleLibelle}`;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Récapitulatif de votre réservation</h2>

            <div className={styles.recap}>
                <div className={styles.recapRow}>
                    <span className={styles.recapLabel}>Adresse</span>
                    <span className={styles.recapValue}>{adresseLabel}</span>
                </div>
                <div className={styles.recapRow}>
                    <span className={styles.recapLabel}>Vélo</span>
                    <span className={styles.recapValue}>{cycleLabel}</span>
                </div>
                <div className={styles.recapRow}>
                    <span className={styles.recapLabel}>Forfait</span>
                    <span className={styles.recapValue}>
                        {forfait.nom}
                        <span className={styles.recapMeta}>
                            {formatDuree(forfait.dureeMinutes)}
                            {forfait.prix !== null && ` · ${forfait.prix.toFixed(2)} €`}
                        </span>
                    </span>
                </div>
                <div className={styles.recapRow}>
                    <span className={styles.recapLabel}>Créneau</span>
                    <span className={styles.recapValue}>
                        {formatDate(creneau.dateDebut)}
                        <span className={styles.recapMeta}>
                            {formatTime(creneau.dateDebut)} → {formatTime(creneau.dateFin)}
                        </span>
                    </span>
                </div>
            </div>

            {!showCommentForm ? (
                <button
                    className={styles.addCommentBtn}
                    onClick={() => setShowCommentForm(true)}
                >
                    + Ajouter un commentaire ou des photos
                </button>
            ) : (
                <div className={styles.commentSection}>
                    <CommentaireEtPhotosForm embedded />
                </div>
            )}

            {error && <p className={styles.errorText}>{error}</p>}

            <div className={styles.actions}>
                <CTAButton onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? 'Validation en cours…' : 'Valider l\'intervention'}
                </CTAButton>
                <button className={styles.backButton} onClick={() => goToStep('creneau')}>
                    Retour
                </button>
            </div>
        </div>
    );
}
