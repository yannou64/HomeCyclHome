import type { CSSProperties } from 'react';
import type { CarteTechnicien } from '../../../types/planning.types';
import { formaterJour } from '../../../utils/jourCalendrier';
import { couleurAffichee } from '../../../../../shared/utils/couleursZones';
import styles from './EnteteTechnicien.module.scss';

interface EnteteTechnicienProps {
    nom: string; // « Prénom Nom »
    journee: CarteTechnicien | null; // zone du jour et « planifié jusqu'au »
    onPlanifier: () => void;
}

/**
 * En-tête de la page d'un technicien (maquette « Page d'un technicien ») :
 * son nom, la zone du jour choisi et « planifié jusqu'au » ; à droite,
 * *Libérer le planning* et *Planifier* (RG7 : chacun ouvre son propre écran).
 *
 * *Libérer le planning* reste désactivé jusqu'à la livraison de « Libérer le
 * planning d'un technicien 2.0 » en S7 (écart du 24/11/2026, option A).
 */
export function EnteteTechnicien({
    nom,
    journee,
    onPlanifier,
}: EnteteTechnicienProps) {
    return (
        <div className={styles.entete}>
            <div className={styles.identite}>
                <h2 className={styles.nom}>{nom}</h2>
                <p className={styles.repere}>
                    {journee?.zone && (
                        <span
                            className={styles.badge}
                            // Teinte de la zone (gris si inactive) : variable CSS
                            style={
                                {
                                    '--badge-couleur': couleurAffichee(
                                        journee.zone,
                                    ),
                                } as CSSProperties
                            }
                        >
                            {journee.zone.nomZone}
                        </span>
                    )}
                    {journee?.planifieJusquau ? (
                        <span>
                            Planifié jusqu'au{' '}
                            <strong>
                                {formaterJour(journee.planifieJusquau)}
                            </strong>
                        </span>
                    ) : (
                        journee && <span>Non planifié</span>
                    )}
                </p>
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.boutonLiberer}
                    disabled
                    title="Disponible prochainement"
                >
                    Libérer le planning
                </button>
                <button
                    type="button"
                    className={styles.boutonPlanifier}
                    onClick={onPlanifier}
                >
                    Planifier
                </button>
            </div>
        </div>
    );
}
