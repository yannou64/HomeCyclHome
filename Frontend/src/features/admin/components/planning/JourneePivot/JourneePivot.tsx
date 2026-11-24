import { useAdminZones } from '../../../hooks/useAdminZones';
import { useJournee } from '../../../hooks/useJournee';
import { formaterJour } from '../../../utils/jourCalendrier';
import { CarteTechnicienJour } from '../CarteTechnicienJour/CarteTechnicienJour';
import { CarteZoneJour } from '../CarteZoneJour/CarteZoneJour';
import styles from './JourneePivot.module.scss';

interface JourneePivotProps {
    date: string; // date pivot 'AAAA-MM-JJ' ('' tant qu'elle est inconnue)
    onDetail: (technicienId: string) => void; // ouvre la page du technicien
}

/**
 * Niveaux 2 et 3 de la page Planning (US-02) : une carte par technicien et
 * une carte par zone pour la date pivot, mises à jour quand elle change.
 */
export function JourneePivot({ date, onDetail }: JourneePivotProps) {
    const { journee, isLoading, error } = useJournee(date);
    // Tracés des zones, pour les miniatures : la route des zones les donne
    // déjà (aucune donnée nouvelle côté API)
    const { items: zones } = useAdminZones();
    const tracePar = new Map(zones.map((z) => [z.id, z.points]));

    if (error) return <p className={styles.error}>{error}</p>;
    if (!journee) {
        return isLoading ? <p className={styles.info}>Chargement…</p> : null;
    }

    return (
        <div className={styles.journee}>
            <p className={styles.date}>
                Journée du <strong>{formaterJour(journee.date)}</strong>
            </p>

            <section aria-labelledby="titre-techniciens">
                <h3 id="titre-techniciens" className={styles.titre}>
                    Techniciens
                </h3>
                {journee.techniciens.length === 0 ? (
                    <p className={styles.info}>Aucun technicien.</p>
                ) : (
                    <div className={styles.grilleTechniciens}>
                        {journee.techniciens.map((c) => (
                            <CarteTechnicienJour
                                key={c.id}
                                carte={c}
                                onDetail={() => onDetail(c.id)}
                            />
                        ))}
                    </div>
                )}
            </section>

            <section aria-labelledby="titre-zones">
                <h3 id="titre-zones" className={styles.titre}>
                    Zones
                </h3>
                {journee.zones.length === 0 ? (
                    <p className={styles.info}>Aucune zone.</p>
                ) : (
                    <div className={styles.grilleZones}>
                        {journee.zones.map((c) => (
                            <CarteZoneJour
                                key={c.id}
                                carte={c}
                                points={tracePar.get(c.id) ?? []}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
