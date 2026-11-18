import { useState } from 'react';
import { useTechniciens } from '../../../hooks/useTechniciens';
import { PlanificationTechnicien } from '../PlanificationTechnicien/PlanificationTechnicien';
import styles from './AdminPlanningSection.module.scss';

/**
 * Section Planning de l'admin.
 *
 * Point d'entrée provisoire (écart du 18/11/2026, option c) : un sélecteur de
 * technicien ouvre son écran Planification. En S3, le parcours définitif le
 * remplacera : Couverture des zones → Détail d'un technicien → Planifier.
 */
export function AdminPlanningSection() {
    const { techniciens, error } = useTechniciens();
    const [technicienId, setTechnicienId] = useState('');

    const technicien = techniciens.find((t) => t.id === technicienId);

    if (technicien) {
        // key : un autre technicien remonte l'écran (formulaire réinitialisé)
        return (
            <PlanificationTechnicien
                key={technicien.id}
                technicien={technicien}
                onRetour={() => setTechnicienId('')}
            />
        );
    }

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Planification</h2>

            <div className={styles.selectorWrapper}>
                <label
                    htmlFor="planning-technicien"
                    className={styles.selectorLabel}
                >
                    Technicien
                </label>
                <select
                    id="planning-technicien"
                    className={styles.selector}
                    value={technicienId}
                    onChange={(e) => setTechnicienId(e.target.value)}
                >
                    <option value="">— Sélectionner un technicien —</option>
                    {techniciens.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.prenom} {t.nom}
                        </option>
                    ))}
                </select>
            </div>

            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}
