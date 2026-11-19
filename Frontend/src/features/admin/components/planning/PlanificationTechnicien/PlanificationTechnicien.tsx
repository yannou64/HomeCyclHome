import { useState } from 'react';
import { useModelesTechnicien } from '../../../hooks/useModelesTechnicien';
import type { AdminUser } from '../../../types/admin.types';
import { ModeleEdition } from '../ModeleEdition/ModeleEdition';
import { ModeleForm } from '../ModeleForm/ModeleForm';
import { ModelesListe } from '../ModelesListe/ModelesListe';
import styles from './PlanificationTechnicien.module.scss';

// Ce que montre la page : la liste, la création, ou l'écran d'un modèle
type Vue =
    | { ecran: 'liste' }
    | { ecran: 'creation' }
    | { ecran: 'modele'; modeleId: string };

interface PlanificationTechnicienProps {
    technicien: AdminUser;
    onRetour: () => void;
}

/**
 * Page Planification d'un technicien (wireframe « planning 2.0 ») : la liste
 * de ses modèles, *Créer un nouveau modèle* et *Planification libre*.
 *
 * Avancée en S2 pour administrer les modèles (écart du 18/11/2026, option c) :
 * créer, ouvrir et modifier un modèle (écran d'un modèle, écart du 19/11/2026,
 * option A). La planification libre et la génération des créneaux arrivent en
 * S3 (« Planifier un technicien 2.0 »).
 */
export function PlanificationTechnicien({
    technicien,
    onRetour,
}: PlanificationTechnicienProps) {
    const { modeles, isLoading, error, reload } = useModelesTechnicien(
        technicien.id,
    );
    const [vue, setVue] = useState<Vue>({ ecran: 'liste' });
    const nomTechnicien = `${technicien.prenom} ${technicien.nom}`;

    const retourListe = () => setVue({ ecran: 'liste' });
    const apresEnregistrement = () => {
        reload(); // la liste affiche le modèle créé ou modifié
        retourListe();
    };

    if (vue.ecran === 'creation') {
        return (
            <ModeleForm
                technicienId={technicien.id}
                onEnregistre={apresEnregistrement}
                onRetour={retourListe}
            />
        );
    }

    if (vue.ecran === 'modele') {
        return (
            <ModeleEdition
                technicienId={technicien.id}
                modeleId={vue.modeleId}
                onEnregistre={apresEnregistrement}
                onRetour={retourListe}
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

                <ModelesListe
                    modeles={modeles}
                    onOuvrir={(modeleId) =>
                        setVue({ ecran: 'modele', modeleId })
                    }
                />
            </section>

            <div className={styles.entrees}>
                <button
                    type="button"
                    className={styles.boutonEntree}
                    onClick={() => setVue({ ecran: 'creation' })}
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
