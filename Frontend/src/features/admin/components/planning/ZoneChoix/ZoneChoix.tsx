import type { ZoneProposee } from '../../../types/planning.types';
import { PastilleCouleur } from '../../zones/PastilleCouleur/PastilleCouleur';
import styles from './ZoneChoix.module.scss';

interface ZoneChoixProps {
    zones: ZoneProposee[]; // affectées au technicien et actives (RG5)
    valeur: string; // id de la zone choisie, '' si aucune
    couleur: string; // teinte de la zone choisie (ou gris si aucune)
    onChange: (zoneId: string) => void;
    erreur?: string | null; // échec du chargement des zones
    disabled?: boolean;
}

/** Champ « Zone » d'un modèle : la pastille de la zone choisie, puis la liste. */
export function ZoneChoix({
    zones,
    valeur,
    couleur,
    onChange,
    erreur,
    disabled,
}: ZoneChoixProps) {
    return (
        <label className={styles.champ}>
            <span className={styles.label}>Zone</span>
            <span className={styles.zone}>
                <PastilleCouleur hex={couleur} />
                <select
                    className={styles.input}
                    value={valeur}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                >
                    <option value="">Choisir une zone</option>
                    {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                            {z.nomZone}
                        </option>
                    ))}
                </select>
            </span>
            {erreur && <p className={styles.error}>{erreur}</p>}
        </label>
    );
}
