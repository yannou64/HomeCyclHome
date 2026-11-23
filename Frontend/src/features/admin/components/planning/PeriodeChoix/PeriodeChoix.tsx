import type { Periode } from '../../../types/planning.types';
import styles from './PeriodeChoix.module.scss';

interface PeriodeChoixProps {
    valeur: Periode;
    onChange: (periode: Periode) => void;
    demain: string; // 'AAAA-MM-JJ', calculé par l'API (RG6)
    disabled?: boolean;
}

/**
 * Période d'une planification, du … au …, bornes incluses (RG6).
 *
 * Les bornes `min` des champs date empêchent de choisir une date de début
 * avant demain, ou une fin avant le début. C'est un confort : le serveur
 * refait ces contrôles et refuse une saisie invalide.
 */
export function PeriodeChoix({
    valeur,
    onChange,
    demain,
    disabled,
}: PeriodeChoixProps) {
    return (
        <fieldset className={styles.periode} disabled={disabled}>
            <legend className={styles.label}>Période</legend>
            <div className={styles.dates}>
                <label className={styles.date}>
                    <span className={styles.sousLabel}>Du</span>
                    <input
                        type="date"
                        className={styles.input}
                        value={valeur.dateDebut}
                        min={demain}
                        onChange={(e) =>
                            onChange({ ...valeur, dateDebut: e.target.value })
                        }
                    />
                </label>
                <label className={styles.date}>
                    <span className={styles.sousLabel}>Au</span>
                    <input
                        type="date"
                        className={styles.input}
                        value={valeur.dateFin}
                        // La fin ne précède pas le début (une seule journée
                        // possible : fin = début)
                        min={valeur.dateDebut || demain}
                        onChange={(e) =>
                            onChange({ ...valeur, dateFin: e.target.value })
                        }
                    />
                </label>
            </div>
        </fieldset>
    );
}
