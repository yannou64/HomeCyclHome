import type { CSSProperties } from 'react';
import type { BlocHoraire } from '../../../types/planning.types';
import { formaterHeure } from '../../../utils/blocsHoraires';
import styles from './FriseJournee.module.scss';

const DEBUT = 7 * 60; // 7h00, haut de la frise
const FIN = 20 * 60; // 20h00, bas de la frise
const DUREE = FIN - DEBUT;
const HEURES = Array.from({ length: 14 }, (_, i) => 7 + i); // 7h … 20h

interface FriseJourneeProps {
    blocs: BlocHoraire[];
    couleur: string; // teinte de la zone choisie (ou gris si aucune)
}

/**
 * Aperçu d'une journée type de 7h00 à 20h00 : chaque bloc est dessiné à sa
 * place, dans la couleur de la zone. Les blocs sont semi-transparents : un
 * chevauchement apparaît plus foncé.
 *
 * Purement visuel (aria-hidden) : les mêmes informations sont dans les champs
 * du formulaire, lisibles par un lecteur d'écran.
 */
export function FriseJournee({ blocs, couleur }: FriseJourneeProps) {
    return (
        <div className={styles.frise} aria-hidden="true">
            {HEURES.map((h) => (
                <div
                    key={h}
                    className={styles.heure}
                    style={position(h * 60, h * 60)}
                >
                    <span className={styles.libelle}>{h}h</span>
                </div>
            ))}

            {blocs
                .filter((b) => b.fin > b.debut)
                .map((b, i) => (
                    <div
                        key={i}
                        className={styles.bloc}
                        style={{
                            ...position(b.debut, b.fin),
                            ['--bloc-couleur' as string]: couleur,
                        }}
                    >
                        {formaterHeure(b.debut)} – {formaterHeure(b.fin)}
                    </div>
                ))}
        </div>
    );
}

/**
 * Place un élément sur la frise. Valeurs calculées à l'exécution : elles
 * passent par des variables CSS, seul style inline admis (Frontend/CLAUDE.md).
 */
function position(debut: number, fin: number): CSSProperties {
    return {
        ['--haut' as string]: `${((debut - DEBUT) / DUREE) * 100}%`,
        ['--hauteur' as string]: `${((fin - debut) / DUREE) * 100}%`,
    };
}
