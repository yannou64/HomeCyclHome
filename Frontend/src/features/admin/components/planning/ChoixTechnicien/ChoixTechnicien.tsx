import type { AdminUser } from '../../../types/admin.types';
import styles from './ChoixTechnicien.module.scss';

interface ChoixTechnicienProps {
    techniciens: AdminUser[];
    onChoisir: (technicienId: string) => void;
    erreur?: string | null;
}

/**
 * Accès provisoire à l'écran Planification d'un technicien (modèles). En S3,
 * le bouton *Détail* des cartes technicien le remplacera (écart du
 * 22/11/2026, option B).
 */
export function ChoixTechnicien({
    techniciens,
    onChoisir,
    erreur,
}: ChoixTechnicienProps) {
    return (
        <div className={styles.champ}>
            <label htmlFor="planning-technicien" className={styles.label}>
                Planification d'un technicien
            </label>
            <select
                id="planning-technicien"
                className={styles.selector}
                value=""
                onChange={(e) => onChoisir(e.target.value)}
            >
                <option value="">— Sélectionner un technicien —</option>
                {techniciens.map((t) => (
                    <option key={t.id} value={t.id}>
                        {t.prenom} {t.nom}
                    </option>
                ))}
            </select>
            {erreur && <p className={styles.error}>{erreur}</p>}
        </div>
    );
}
