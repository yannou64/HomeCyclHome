import type { CSSProperties } from 'react';
import type { CarteTechnicien } from '../../../types/planning.types';
import { blocsDesCreneaux } from '../../../utils/creneauxFrise';
import { formaterJour } from '../../../utils/jourCalendrier';
import { couleurAffichee } from '../../../../../shared/utils/couleursZones';
import { FriseJournee } from '../FriseJournee/FriseJournee';
import styles from './CarteTechnicienJour.module.scss';

interface CarteTechnicienJourProps {
    carte: CarteTechnicien;
    onVoirPlanning: () => void; // ouvre la page du technicien, à la date pivot
}

/**
 * Carte d'un technicien pour la date pivot (US-02 « Consulter la journée des
 * techniciens et les disponibilités des zones 2.0 ») : sa zone du jour, ses
 * créneaux sur la plage fixe 7h–20h, « planifié jusqu'au », et le bouton
 * *Voir son planning* vers la page du technicien (CA17).
 *
 * Le bouton s'appelait *Détail* dans la spec : renommé et passé en bouton
 * principal pleine largeur, car c'est le point d'entrée de la planification
 * (décision de Yannick, écart du 24/11/2026).
 */
export function CarteTechnicienJour({
    carte,
    onVoirPlanning,
}: CarteTechnicienJourProps) {
    const nom = `${carte.prenom} ${carte.nom}`;
    const blocs = blocsDesCreneaux(carte.creneaux);

    return (
        <article className={styles.carte} aria-label={nom}>
            <header className={styles.entete}>
                <h4 className={styles.nom}>{nom}</h4>
                {carte.zone && (
                    <span
                        className={styles.badge}
                        // Teinte de la zone, calculée à l'exécution : variable CSS
                        style={
                            {
                                '--badge-couleur': couleurAffichee(carte.zone),
                            } as CSSProperties
                        }
                    >
                        {carte.zone.nomZone}
                    </span>
                )}
            </header>

            <FriseJournee
                taille="compacte" // la rangée de cartes tient sans défiler
                blocs={blocs}
                titre={
                    blocs.length
                        ? `Créneaux de ${nom} ce jour-là`
                        : `Aucun créneau pour ${nom} ce jour-là`
                }
            />

            <p className={styles.repere}>
                {carte.planifieJusquau ? (
                    <>
                        Planifié jusqu'au{' '}
                        <strong>{formaterJour(carte.planifieJusquau)}</strong>
                    </>
                ) : (
                    'Non planifié'
                )}
            </p>

            {/* Point d'entrée de la planification : bouton principal, toute la
                largeur de la carte */}
            <button
                type="button"
                className={styles.boutonPlanning}
                onClick={onVoirPlanning}
                aria-label={`Voir le planning de ${nom}`}
            >
                Voir son planning
            </button>
        </article>
    );
}
