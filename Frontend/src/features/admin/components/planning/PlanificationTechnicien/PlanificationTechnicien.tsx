import { useState } from 'react';
import { useModelesTechnicien } from '../../../hooks/useModelesTechnicien';
import type { AdminUser } from '../../../types/admin.types';
import { hexDeCouleur } from '../../../../../shared/utils/couleursZones';
import { PastilleCouleur } from '../../zones/PastilleCouleur/PastilleCouleur';
import { ModeleCreationForm } from '../ModeleCreationForm/ModeleCreationForm';
import styles from './PlanificationTechnicien.module.scss';

interface PlanificationTechnicienProps {
    technicien: AdminUser;
    onRetour: () => void;
}

/**
 * Page Planification d'un technicien (wireframe « planning 2.0 ») : la liste
 * de ses modèles, *Créer un nouveau modèle* et *Planification libre*.
 *
 * Avancée en S2 pour la création d'un modèle (écart du 18/11/2026, option c).
 * Ouvrir un modèle, la planification libre et le repère rouge des modèles
 * invalides arrivent en S3 (« Choisir le mode de planification 2.0 »).
 */
export function PlanificationTechnicien({
    technicien,
    onRetour,
}: PlanificationTechnicienProps) {
    const { modeles, isLoading, error, reload } = useModelesTechnicien(
        technicien.id,
    );
    const [vue, setVue] = useState<'liste' | 'creation'>('liste');
    const nomTechnicien = `${technicien.prenom} ${technicien.nom}`;

    if (vue === 'creation') {
        return (
            <ModeleCreationForm
                technicienId={technicien.id}
                onCree={() => {
                    reload(); // la liste affiche le nouveau modèle
                    setVue('liste');
                }}
                onRetour={() => setVue('liste')}
            />
        );
    }

    return (
        <div className={styles.wrapper}>
            {/* Règles d'interface : « ← Retour » en haut à gauche, au-dessus du titre */}
            <button type="button" className={styles.retour} onClick={onRetour}>
                ← Retour
            </button>
            <h2 className={styles.technicien}>{nomTechnicien}</h2>
            <p className={styles.titre}>Planification</p>

            <section className={styles.modeles} aria-labelledby="titre-modeles">
                <h3 id="titre-modeles" className={styles.sousTitre}>
                    Modèles
                </h3>

                {isLoading && <p className={styles.info}>Chargement…</p>}
                {error && <p className={styles.error}>{error}</p>}
                {!isLoading && !error && modeles.length === 0 && (
                    <p className={styles.info}>
                        Aucun modèle pour ce technicien.
                    </p>
                )}

                <ul className={styles.liste}>
                    {modeles.map((m) => (
                        <li key={m.id} className={styles.modele}>
                            <PastilleCouleur
                                hex={hexDeCouleur(m.zone.couleur)}
                                titre={m.zone.couleur}
                            />
                            <span className={styles.intitule}>
                                {m.intitule}
                            </span>
                            <span className={styles.zone}>
                                {m.zone.nomZone}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            <div className={styles.entrees}>
                <button
                    type="button"
                    className={styles.boutonEntree}
                    onClick={() => setVue('creation')}
                >
                    Créer un nouveau modèle
                </button>
                <button
                    type="button"
                    className={styles.boutonEntree}
                    disabled
                    title="Disponible prochainement"
                >
                    Planification libre
                </button>
            </div>
        </div>
    );
}
