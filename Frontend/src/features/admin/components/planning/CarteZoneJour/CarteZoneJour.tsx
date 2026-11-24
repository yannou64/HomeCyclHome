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
 * « dernière couverture le ». Sous la frise, la miniature du tracé (écart du
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

            {/* « Non couverte » ou « Complet » : la frise serait vide ; l'état
                prend sa place, à la même hauteur, pour que les cartes restent
                alignées (choix de Yannick du 24/11/2026) */}
            {etat ? (
                <p className={styles.etat}>{etat}</p>
            ) : (
                <FriseJournee
                    taille="compacte"
                    blocs={blocs}
                    titre={`Disponibilités de ${carte.nomZone} : ${blocs.length} tranche(s) libre(s)`}
                />
            )}

            {/* Tracé de la zone, sous ses disponibilités, sur toute la
                largeur de la carte (choix de Yannick du 24/11/2026) */}
            <ZoneMiniature
                nomZone={carte.nomZone}
                points={points}
                couleur={couleurAffichee(carte)}
            />

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
