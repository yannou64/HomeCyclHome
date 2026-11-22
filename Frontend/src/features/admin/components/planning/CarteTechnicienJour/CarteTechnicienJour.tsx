import type { CSSProperties } from 'react';
import type {
    CarteTechnicien,
    StatutCreneau,
} from '../../../types/planning.types';
import { formaterJour } from '../../../utils/jourCalendrier';
import { couleurAffichee } from '../../../../../shared/utils/couleursZones';
import { FriseJournee, type VarianteBloc } from '../FriseJournee/FriseJournee';
import styles from './CarteTechnicienJour.module.scss';

const DUREE_CRENEAU = 30;

// Statut d'un créneau → apparence sur la frise (RG8 : trois effets distincts)
const VARIANTE: Record<StatutCreneau, VarianteBloc> = {
    Libre: 'libre',
    Deplacement: 'deplacement',
    InterventionReservee: 'reservee',
};

interface CarteTechnicienJourProps {
    carte: CarteTechnicien;
}

/**
 * Carte d'un technicien pour la date pivot (US-02 « Consulter la journée des
 * techniciens et les disponibilités des zones 2.0 ») : sa zone du jour, ses
 * créneaux sur la plage fixe 7h–20h, « planifié jusqu'au ». Le bouton
 * *Détail* arrive en S3 avec la page du technicien (écart du 22/11/2026).
 */
export function CarteTechnicienJour({ carte }: CarteTechnicienJourProps) {
    const nom = `${carte.prenom} ${carte.nom}`;
    const blocs = carte.creneaux.map((c) => ({
        debut: c.debut,
        fin: c.debut + DUREE_CRENEAU,
        variante: VARIANTE[c.statut],
    }));

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
        </article>
    );
}
