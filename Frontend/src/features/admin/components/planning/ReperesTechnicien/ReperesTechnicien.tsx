import type { CSSProperties } from 'react';
import type { CarteTechnicien } from '../../../types/planning.types';
import { formaterJour } from '../../../utils/jourCalendrier';
import { couleurAffichee } from '../../../../../shared/utils/couleursZones';
import styles from './ReperesTechnicien.module.scss';

interface ReperesTechnicienProps {
    journee: CarteTechnicien | null; // null tant qu'elle n'est pas chargée
}

/**
 * Repères du technicien, sous son calendrier (à la place du texte d'aide,
 * choix de Yannick du 24/11/2026), sur une ligne : à gauche, la date de son
 * dernier créneau (« Planifié jusqu'au … ») ; à droite, la zone qu'il couvre
 * le jour choisi, dans sa couleur (gris si elle est inactive).
 */
export function ReperesTechnicien({ journee }: ReperesTechnicienProps) {
    // Pendant le chargement : la ligne vide garde sa hauteur (le cadre du
    // calendrier ne bouge pas quand les repères arrivent)
    if (!journee) return <div className={styles.reperes} />;

    return (
        <div className={styles.reperes}>
            <p className={styles.planifie}>
                {journee.planifieJusquau ? (
                    <>
                        Planifié jusqu'au{' '}
                        <strong>{formaterJour(journee.planifieJusquau)}</strong>
                    </>
                ) : (
                    'Non planifié'
                )}
            </p>

            {journee.zone && (
                <span
                    className={styles.badge}
                    // Teinte de la zone, calculée à l'exécution : variable CSS
                    style={
                        {
                            '--badge-couleur': couleurAffichee(journee.zone),
                        } as CSSProperties
                    }
                >
                    {journee.zone.nomZone}
                </span>
            )}
        </div>
    );
}
