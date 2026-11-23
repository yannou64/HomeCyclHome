import { useState } from 'react';
import { useModelesTechnicien } from '../../../hooks/useModelesTechnicien';
import { useSupprimerModele } from '../../../hooks/useSupprimerModele';
import type { AdminUser } from '../../../types/admin.types';
import { ModeleEdition } from '../ModeleEdition/ModeleEdition';
import { ModeleForm } from '../ModeleForm/ModeleForm';
import { ModelesListe } from '../ModelesListe/ModelesListe';
import { PlanificationLibre } from '../PlanificationLibre/PlanificationLibre';
import { SupprimerModeleDialog } from '../SupprimerModeleDialog/SupprimerModeleDialog';
import styles from './PlanificationTechnicien.module.scss';

// Ce que montre la page : la liste, la création, l'écran d'un modèle ou la
// planification libre
type Vue =
    | { ecran: 'liste' }
    | { ecran: 'creation' }
    | { ecran: 'modele'; modeleId: string }
    | { ecran: 'libre' };

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
 * option A). La planification libre s'ouvre vide (US-01 « Choisir le mode de
 * planification 2.0 ») ; la période et la génération arrivent avec les US-02
 * et US-03.
 */
export function PlanificationTechnicien({
    technicien,
    onRetour,
}: PlanificationTechnicienProps) {
    const { modeles, isLoading, error, reload } = useModelesTechnicien(
        technicien.id,
    );
    const { supprimer } = useSupprimerModele(technicien.id);
    const [vue, setVue] = useState<Vue>({ ecran: 'liste' });
    // Modèle dont la suppression attend confirmation (null : fenêtre fermée)
    const [aSupprimer, setASupprimer] = useState<string | null>(null);
    const nomTechnicien = `${technicien.prenom} ${technicien.nom}`;

    const retourListe = () => setVue({ ecran: 'liste' });
    const apresEnregistrement = () => {
        reload(); // la liste affiche le modèle créé ou modifié
        retourListe();
    };

    // « Continuer » : supprime, puis retour à la liste rechargée (séquence
    // de l'US-03, étape 13). Une erreur remonte à la fenêtre, qui l'affiche.
    const confirmerSuppression = async () => {
        if (!aSupprimer) return;
        await supprimer(aSupprimer);
        setASupprimer(null);
        apresEnregistrement();
    };

    // La fenêtre est la même depuis l'écran d'un modèle et depuis la liste
    const dialogue = (
        <SupprimerModeleDialog
            isOpen={aSupprimer !== null}
            onClose={() => setASupprimer(null)}
            onConfirm={confirmerSuppression}
        />
    );

    if (vue.ecran === 'creation') {
        return (
            <ModeleForm
                technicienId={technicien.id}
                onEnregistre={apresEnregistrement}
                onRetour={retourListe}
            />
        );
    }

    // Planification libre : écran vide, sans modèle (US-01, CA09)
    if (vue.ecran === 'libre') {
        return (
            <PlanificationLibre
                technicienId={technicien.id}
                onRetour={retourListe}
            />
        );
    }

    if (vue.ecran === 'modele') {
        return (
            <>
                <ModeleEdition
                    technicienId={technicien.id}
                    modeleId={vue.modeleId}
                    onEnregistre={apresEnregistrement}
                    onRetour={retourListe}
                    onSupprimer={() => setASupprimer(vue.modeleId)}
                />
                {dialogue}
            </>
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
                    onSupprimer={setASupprimer}
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
                    onClick={() => setVue({ ecran: 'libre' })}
                >
                    Planification libre
                </button>
            </div>
            {dialogue}
        </div>
    );
}
