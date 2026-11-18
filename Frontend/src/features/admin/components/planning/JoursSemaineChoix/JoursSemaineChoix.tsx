import { JOURS_SEMAINE, type JourSemaine } from '../../../types/planning.types';
import styles from './JoursSemaineChoix.module.scss';

interface JoursSemaineChoixProps {
    valeur: JourSemaine[];
    onChange: (jours: JourSemaine[]) => void;
    disabled?: boolean;
}

/** « lundi » → « Lun ». */
const abreger = (jour: JourSemaine) =>
    jour.charAt(0).toUpperCase() + jour.slice(1, 3);

/**
 * Jours de la semaine en pastilles à bascule, sur une ligne. Au moins un
 * jour est requis (RG6).
 *
 * Accessibilité : chaque pastille est un bouton à bascule (aria-pressed), qui
 * annonce le nom complet du jour et s'il est choisi.
 */
export function JoursSemaineChoix({
    valeur,
    onChange,
    disabled = false,
}: JoursSemaineChoixProps) {
    // Garde toujours l'ordre de la semaine, quel que soit l'ordre des clics
    const definir = (choisis: JourSemaine[]) =>
        onChange(JOURS_SEMAINE.filter((j) => choisis.includes(j)));

    const basculer = (jour: JourSemaine) =>
        definir(
            valeur.includes(jour)
                ? valeur.filter((j) => j !== jour)
                : [...valeur, jour],
        );

    return (
        <fieldset className={styles.fieldset} disabled={disabled}>
            {/* Premier enfant direct du fieldset : nom accessible du groupe */}
            <legend className={styles.legend}>Jours</legend>

            <div className={styles.jours}>
                {JOURS_SEMAINE.map((jour) => (
                    <button
                        key={jour}
                        type="button"
                        className={styles.jour}
                        aria-pressed={valeur.includes(jour)}
                        aria-label={jour}
                        onClick={() => basculer(jour)}
                    >
                        {abreger(jour)}
                    </button>
                ))}
            </div>
        </fieldset>
    );
}
