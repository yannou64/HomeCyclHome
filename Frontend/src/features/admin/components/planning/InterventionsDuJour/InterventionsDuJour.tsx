import type { InterventionTechnicien } from '../../../types/planning.types';
import { CarteIntervention } from '../CarteIntervention/CarteIntervention';
import styles from './InterventionsDuJour.module.scss';

interface InterventionsDuJourProps {
    interventions: InterventionTechnicien[]; // déjà triées par l'API (CA08)
    isLoading: boolean;
}

/**
 * Interventions du jour choisi sur la page d'un technicien (US-02 « Consulter
 * les interventions d'un technicien 2.0 ») : une carte par intervention, dans
 * l'ordre des heures. Lecture seule.
 */
export function InterventionsDuJour({
    interventions,
    isLoading,
}: InterventionsDuJourProps) {
    return (
        <section aria-labelledby="titre-interventions">
            <h3 id="titre-interventions" className={styles.titre}>
                Interventions du jour
            </h3>

            {isLoading && interventions.length === 0 && (
                <p className={styles.info}>Chargement…</p>
            )}
            {!isLoading && interventions.length === 0 && (
                <p className={styles.info}>Aucune intervention ce jour-là.</p>
            )}

            {interventions.length > 0 && (
                <div className={styles.grille}>
                    {interventions.map((i, index) => (
                        <CarteIntervention
                            key={i.id}
                            intervention={i}
                            numero={index + 1}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
