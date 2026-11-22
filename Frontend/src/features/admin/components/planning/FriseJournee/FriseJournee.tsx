import type { CSSProperties } from 'react';
import type { BlocHoraire } from '../../../types/planning.types';
import { formaterHeure } from '../../../utils/blocsHoraires';
import styles from './FriseJournee.module.scss';

const DEBUT = 7 * 60; // 7h00, haut de la frise
const FIN = 20 * 60; // 20h00, bas de la frise
const DUREE = FIN - DEBUT;
const HEURES = Array.from({ length: 14 }, (_, i) => 7 + i); // 7h … 20h

/**
 * Apparence d'un bloc. Par défaut « plein » : un bloc d'un modèle, dans la
 * couleur de la zone, avec ses heures. Les trois autres montrent les statuts
 * d'un créneau (« Visualiser la couverture », RG8 et RG9).
 */
export type VarianteBloc = 'plein' | 'libre' | 'deplacement' | 'reservee';

export type BlocFrise = BlocHoraire & { variante?: VarianteBloc };

interface FriseJourneeProps {
    blocs: BlocFrise[];
    couleur?: string; // teinte des blocs pleins (zone choisie, ou gris)
    titre?: string; // nom accessible ; absent : frise décorative (aria-hidden)
}

/**
 * Une journée de 7h00 à 20h00, la même plage fixe partout : chaque bloc est
 * dessiné à sa place.
 * - Formulaire d'un modèle : blocs pleins, dans la couleur de la zone,
 *   semi-transparents (un chevauchement apparaît plus foncé). Purement visuel :
 *   les mêmes informations sont dans les champs du formulaire.
 * - Cartes de la page Planning : un bloc de 30 min par créneau, selon son
 *   statut. Le statut est aussi donné en infobulle.
 */
export function FriseJournee({
    blocs,
    couleur = 'transparent',
    titre,
}: FriseJourneeProps) {
    return (
        <div
            className={styles.frise}
            {...(titre
                ? { role: 'img', 'aria-label': titre }
                : { 'aria-hidden': true })}
        >
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
                .map((b, i) => {
                    const variante = b.variante ?? 'plein';
                    const heures = `${formaterHeure(b.debut)} – ${formaterHeure(b.fin)}`;
                    return (
                        <div
                            key={i}
                            className={`${styles.bloc} ${styles[variante]}`}
                            style={{
                                ...position(b.debut, b.fin),
                                ['--bloc-couleur' as string]: couleur,
                            }}
                            title={
                                variante === 'plein'
                                    ? undefined
                                    : `${heures} : ${LIBELLES[variante]}`
                            }
                        >
                            {/* Heures écrites dans les blocs d'un modèle ; un
                                créneau de 30 min est trop petit */}
                            {variante === 'plein' && heures}
                        </div>
                    );
                })}
        </div>
    );
}

const LIBELLES: Record<Exclude<VarianteBloc, 'plein'>, string> = {
    libre: 'libre',
    deplacement: 'déplacement',
    reservee: 'intervention réservée',
};

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
