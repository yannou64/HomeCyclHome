import type { JourCouvert, ZoneCouverte } from '../../../types/planning.types';
import { couleurAffichee } from '../../../../../shared/utils/couleursZones';
import { PastilleCouleur } from '../../zones/PastilleCouleur/PastilleCouleur';
import styles from './LegendeZones.module.scss';

interface LegendeZonesProps {
    jours: JourCouvert[]; // jours couverts du mois affiché
}

/**
 * Légende du calendrier (maquette) : les zones couvertes au moins un jour du
 * mois affiché, avec leur couleur. Le point d'une zone se lit « zone couverte
 * ce jour-là ».
 */
export function LegendeZones({ jours }: LegendeZonesProps) {
    // Chaque zone une seule fois, triée par nom
    const zones = new Map<string, ZoneCouverte>();
    for (const jour of jours) {
        for (const z of jour.zones) zones.set(z.id, z);
    }
    const liste = [...zones.values()].sort((a, b) =>
        a.nomZone.localeCompare(b.nomZone),
    );

    return (
        <aside className={styles.legende} aria-label="Légende du calendrier">
            {liste.length === 0 ? (
                <p className={styles.vide}>Aucune zone couverte ce mois-ci.</p>
            ) : (
                <ul className={styles.liste}>
                    {liste.map((z) => (
                        <li key={z.id} className={styles.zone}>
                            <PastilleCouleur hex={couleurAffichee(z)} />
                            {z.nomZone}
                            {!z.isActive && (
                                <span className={styles.inactive}>
                                    (inactive)
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
}
