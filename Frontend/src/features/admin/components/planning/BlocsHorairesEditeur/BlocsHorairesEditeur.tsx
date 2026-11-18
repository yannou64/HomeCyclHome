import type { BlocHoraire } from '../../../types/planning.types';
import {
    HEURES_PROPOSEES,
    blocSuivant,
    erreursBlocs,
    formaterHeure,
} from '../../../utils/blocsHoraires';
import styles from './BlocsHorairesEditeur.module.scss';

interface BlocsHorairesEditeurProps {
    valeur: BlocHoraire[];
    onChange: (blocs: BlocHoraire[]) => void;
    disabled?: boolean;
}

/**
 * Blocs horaires modifiés sur place : une ligne par bloc (début → fin, ✕), et
 * « Ajouter un bloc ». Une fin avant le début ou un chevauchement s'affiche
 * sous la ligne en cause, dès la saisie (séquence de « Créer un modèle »,
 * étape 10). Le serveur refait ces contrôles.
 */
export function BlocsHorairesEditeur({
    valeur,
    onChange,
    disabled = false,
}: BlocsHorairesEditeurProps) {
    const erreurs = erreursBlocs(valeur);
    const suivant = blocSuivant(valeur);

    const modifier = (
        index: number,
        champ: keyof BlocHoraire,
        minutes: number,
    ) =>
        onChange(
            valeur.map((b, i) =>
                i === index ? { ...b, [champ]: minutes } : b,
            ),
        );

    return (
        <fieldset className={styles.fieldset} disabled={disabled}>
            {/* Masquée à l'écran (le bouton suffit à la vue) mais lue par les
                lecteurs d'écran : c'est le nom du groupe de champs */}
            <legend className={styles.legendeMasquee}>
                Blocs horaires, par créneaux de 30 minutes
            </legend>

            {valeur.map((b, i) => {
                const libelle = `${formaterHeure(b.debut)} – ${formaterHeure(b.fin)}`;
                return (
                    // L'index sert de clé : les lignes ne sont jamais réordonnées
                    // pendant la saisie (le focus reste sur la liste modifiée)
                    <div key={i} className={styles.ligne}>
                        <div className={styles.champs}>
                            <SelectHeure
                                libelle={`Début du bloc ${i + 1}`}
                                valeur={b.debut}
                                onChange={(m) => modifier(i, 'debut', m)}
                            />
                            <span aria-hidden="true">→</span>
                            <SelectHeure
                                libelle={`Fin du bloc ${i + 1}`}
                                valeur={b.fin}
                                onChange={(m) => modifier(i, 'fin', m)}
                            />
                            <button
                                type="button"
                                className={styles.supprimer}
                                aria-label={`Supprimer le bloc ${libelle}`}
                                onClick={() =>
                                    onChange(valeur.filter((_, j) => j !== i))
                                }
                            >
                                ✕
                            </button>
                        </div>
                        {erreurs[i] && (
                            <p className={styles.error} role="alert">
                                {erreurs[i]}
                            </p>
                        )}
                    </div>
                );
            })}

            <button
                type="button"
                className={styles.ajouter}
                disabled={!suivant}
                onClick={() => suivant && onChange([...valeur, suivant])}
            >
                + Ajouter un bloc horaire
            </button>
        </fieldset>
    );
}

interface SelectHeureProps {
    libelle: string; // nom accessible (lu par les lecteurs d'écran)
    valeur: number;
    onChange: (minutes: number) => void;
}

/** Liste des heures de 7:00 à 20:00, par pas de 30 min. */
function SelectHeure({ libelle, valeur, onChange }: SelectHeureProps) {
    return (
        <select
            className={styles.select}
            aria-label={libelle}
            value={valeur}
            onChange={(e) => onChange(Number(e.target.value))}
        >
            {HEURES_PROPOSEES.map((m) => (
                <option key={m} value={m}>
                    {formaterHeure(m)}
                </option>
            ))}
        </select>
    );
}
