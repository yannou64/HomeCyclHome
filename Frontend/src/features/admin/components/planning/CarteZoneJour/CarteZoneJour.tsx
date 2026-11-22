import type { CarteZone } from '../../../types/planning.types';
import type { ZonePoint } from '../../../types/zones.types';
import { formaterJour } from '../../../utils/jourCalendrier';
import { couleurAffichee } from '../../../../../shared/utils/couleursZones';
import { PastilleCouleur } from '../../zones/PastilleCouleur/PastilleCouleur';
import { FriseJournee } from '../FriseJournee/FriseJournee';
import { ZoneMiniature } from '../ZoneMiniature/ZoneMiniature';
import styles from './CarteZoneJour.module.scss';

const DUREE_TRANCHE = 30;

// RG9 : états particuliers d'une zone, écrits en clair
const ETAT: Record<CarteZone['etat'], string | null> = {
    disponible: null,
    complet: 'Complet',
    'non couverte': 'Non couverte',
};

interface CarteZoneJourProps {
    carte: CarteZone;
    points: ZonePoint[]; // tracé de la zone, pour la miniature
}

/**
 * Carte d'une zone pour la date pivot (US-02) : les tranches de 30 min où au
 * moins un technicien de la zone est libre, cumulées sans être comptées
 * (RG9), sur la même plage fixe 7h–20h que les cartes technicien, et
 * « dernière couverture le ». À gauche, la miniature du tracé (écart du
 * 22/11/2026).
 */
export function CarteZoneJour({ carte, points }: CarteZoneJourProps) {
    const blocs = carte.tranchesLibres.map((debut) => ({
        debut,
        fin: debut + DUREE_TRANCHE,
        variante: 'libre' as const,
    }));
    const etat = ETAT[carte.etat];

    return (
        <article className={styles.carte} aria-label={carte.nomZone}>
            <header className={styles.entete}>
                <PastilleCouleur hex={couleurAffichee(carte)} />
                <h4 className={styles.nom}>{carte.nomZone}</h4>
                {!carte.isActive && (
                    <span className={styles.inactive}>(inactive)</span>
                )}
            </header>

            <div className={styles.corps}>
                <ZoneMiniature
                    nomZone={carte.nomZone}
                    points={points}
                    couleur={couleurAffichee(carte)}
                />
                <div className={styles.disponibilites}>
                    {etat && <p className={styles.etat}>{etat}</p>}
                    <FriseJournee
                        blocs={blocs}
                        titre={`Disponibilités de ${carte.nomZone} : ${
                            etat ?? `${blocs.length} tranche(s) libre(s)`
                        }`}
                    />
                </div>
            </div>

            <p className={styles.repere}>
                {carte.derniereCouverture ? (
                    <>
                        Dernière couverture le{' '}
                        <strong>
                            {formaterJour(carte.derniereCouverture)}
                        </strong>
                    </>
                ) : (
                    'Aucune couverture'
                )}
            </p>
        </article>
    );
}
