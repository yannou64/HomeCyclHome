import { Link } from 'react-router-dom';
import styles from './AdminMobileBlocker.module.scss';

export function AdminMobileBlocker() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <svg
                    className={styles.icon}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                >
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                </svg>

                <h2 className={styles.title}>
                    Interface Administrateur
                    <br />
                    non disponible sur mobile
                </h2>

                <p className={styles.description}>
                    Pour accéder à l&apos;administration connectez-vous
                    depuis un ordinateur
                </p>

                <Link to="/" className={styles.button}>
                    Accueil
                </Link>
            </div>
        </div>
    );
}
