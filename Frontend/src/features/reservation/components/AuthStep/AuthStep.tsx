import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservation } from '../../../../app/providers/reservationContext/useReservation';
import styles from './AuthStep.module.scss';

export function AuthStep() {
    const { savePendingToStorage, goToStep } = useReservation();
    const navigate = useNavigate();

    // Sauvegarde le tunnel dans le localStorage dès que ce composant est monté.
    // Moment choisi délibérément : l'utilisateur est non-connecté et va quitter la page.
    useEffect(() => {
        savePendingToStorage();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Connectez-vous pour finaliser</h2>
            <p className={styles.description}>
                Votre réservation est presque prête. Connectez-vous ou créez un compte
                pour valider votre intervention.
            </p>

            <div className={styles.actions}>
                <button
                    className={styles.btnPrimary}
                    onClick={() => navigate('/login')}
                >
                    Se connecter
                </button>
                <button
                    className={styles.btnSecondary}
                    onClick={() => navigate('/inscription')}
                >
                    Créer un compte
                </button>
            </div>

            <button
                className={styles.backLink}
                onClick={() => goToStep('creneau')}
            >
                ← Retour au choix du créneau
            </button>
        </div>
    );
}
