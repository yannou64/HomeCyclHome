import {
    PALETTE_ZONES,
    type CouleurZone,
} from '../../../../../shared/utils/couleursZones';
import { PastilleCouleur } from '../PastilleCouleur/PastilleCouleur';
import styles from './ZoneCouleurPicker.module.scss';

interface ZoneCouleurPickerProps {
    valeur: CouleurZone;
    onChange: (couleur: CouleurZone) => void;
    disabled?: boolean;
}

/**
 * Sélecteur de couleur d'une zone : les 12 pastilles de la palette, et elles
 * seules (le gris d'une zone inactive ne se choisit pas).
 *
 * Accessibilité : chaque pastille est un vrai bouton radio, masqué visuellement
 * mais présent pour le clavier et les lecteurs d'écran. Le navigateur gère donc
 * seul les flèches, le focus et l'annonce « Bleu, bouton radio, 8 sur 12 ».
 */
export function ZoneCouleurPicker({
    valeur,
    onChange,
    disabled = false,
}: ZoneCouleurPickerProps) {
    return (
        <fieldset className={styles.fieldset} disabled={disabled}>
            <legend className={styles.legend}>Couleur</legend>

            <div className={styles.pastilles}>
                {PALETTE_ZONES.map(({ nom, hex }) => (
                    <label key={nom} className={styles.option} title={nom}>
                        <input
                            type="radio"
                            name="couleur_zone"
                            value={nom}
                            checked={valeur === nom}
                            onChange={() => onChange(nom)}
                            className={styles.radio}
                        />
                        <PastilleCouleur hex={hex} taille="grande" />
                        {/* Nom lu par les lecteurs d'écran, masqué à l'écran */}
                        <span className={styles.nomMasque}>{nom}</span>
                    </label>
                ))}
            </div>

            <p className={styles.choisie}>Choisie : {valeur}</p>
        </fieldset>
    );
}
