import type { CarteTechnicien } from '../../../types/planning.types';
import { blocsDesCreneaux } from '../../../utils/creneauxFrise';
import { formaterJour, nomDuJour } from '../../../utils/jourCalendrier';
import { FriseJournee } from '../FriseJournee/FriseJournee';
import styles from './JourneeTechnicien.module.scss';

interface JourneeTechnicienProps {
    date: string; // 'AAAA-MM-JJ'
    journee: CarteTechnicien | null; // null tant qu'elle n'est pas chargée
}

/**
 * Journée d'un technicien sur sa page (US-01 « Consulter le calendrier et la
 * journée d'un technicien 2.0 », maquette « Page d'un technicien ») : la date,
 * la légende des trois statuts, puis ses créneaux de 30 min sur la plage fixe
 * 7h–20h (RG3). Même frise que les cartes de la page de couverture.
 */
export function JourneeTechnicien({ date, journee }: JourneeTechnicienProps) {
    const blocs = journee ? blocsDesCreneaux(journee.creneaux) : [];

    return (
        <section className={styles.carte} aria-labelledby="titre-journee">
            <h3 id="titre-journee" className={styles.date}>
                {formaterJour(date)} ·{' '}
                <span className={styles.jour}>{nomDuJour(date)}</span>
            </h3>

            {/* Légende : mêmes apparences que les blocs de la frise (RG3) */}
            <ul className={styles.legende}>
                <li>
                    <span className={`${styles.pastille} ${styles.libre}`} />
                    Libre
                </li>
                <li>
                    <span
                        className={`${styles.pastille} ${styles.deplacement}`}
                    />
                    Déplacement
                </li>
                <li>
                    <span className={`${styles.pastille} ${styles.reservee}`} />
                    Intervention réservée
                </li>
            </ul>

            <FriseJournee
                blocs={blocs}
                titre={
                    blocs.length
                        ? `Créneaux du ${formaterJour(date)}`
                        : `Aucun créneau le ${formaterJour(date)}`
                }
            />
        </section>
    );
}
