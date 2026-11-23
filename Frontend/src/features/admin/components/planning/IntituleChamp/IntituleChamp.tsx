import styles from './IntituleChamp.module.scss';

interface IntituleChampProps {
    valeur: string;
    onChange: (intitule: string) => void;
    disabled?: boolean;
}

/**
 * Titre d'un modèle (100 caractères au plus), sur le formulaire de création
 * et sur l'écran de planification d'un modèle.
 */
export function IntituleChamp({
    valeur,
    onChange,
    disabled,
}: IntituleChampProps) {
    return (
        <label className={styles.champ}>
            <span className={styles.label}>Titre</span>
            <input
                className={styles.input}
                value={valeur}
                maxLength={100}
                placeholder="Ex : Semaine matin"
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            />
        </label>
    );
}
