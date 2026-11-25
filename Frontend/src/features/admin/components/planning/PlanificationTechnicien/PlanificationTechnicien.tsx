import { useState } from 'react';
import { useModelesTechnicien } from '../../../hooks/useModelesTechnicien';
import { useSupprimerModele } from '../../../hooks/useSupprimerModele';
import type { TechnicienNomme } from '../../../types/planning.types';
import { EcranPlanification } from '../EcranPlanification/EcranPlanification';
import { ModeleForm } from '../ModeleForm/ModeleForm';
import { ModelesListe } from '../ModelesListe/ModelesListe';
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
    technicien: TechnicienNomme;
    onRetour: () => void;
}

/**
 * Page Planification d'un technicien (wireframe « planning 2.0 ») : la liste
 * de ses modèles, *Créer un nouveau modèle* et *Planification libre*.
 *
 * Avancée en S2 pour administrer les modèles (écart du 18/11/2026, option c) :
 * créer, ouvrir et modifier un modèle (écran d'un modèle, écart du 19/11/2026,
 * option A). Un modèle et la planification libre s'ouvrent sur le même écran
 * de planification, prérempli ou vide (« Planifier un technicien 2.0 »).
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
            <EcranPlanification
                technicienId={technicien.id}
                onRetour={retourListe}
                onSupprimerModele={() => {}} // aucun modèle à supprimer
            />
        );
    }

    // Écran d'un modèle : le même, prérempli. Au retour, la liste est
    // rechargée : « Modifier le modèle » a pu changer son intitulé.
    if (vue.ecran === 'modele') {
        return (
            <>
                <EcranPlanification
                    technicienId={technicien.id}
                    modeleId={vue.modeleId}
                    onRetour={apresEnregistrement}
                    onSupprimerModele={() => setASupprimer(vue.modeleId)}
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
            <h2 className={styles.titre}>
                Planification —{' '}
                <span className={styles.technicien}>{nomTechnicien}</span>
            </h2>

            {/* Deux sections côte à côte (choix de Yannick du 25/11/2026) :
                à gauche les modèles existants, à droite les actions */}
            <div className={styles.colonnes}>
                <section
                    className={styles.cadre}
                    aria-labelledby="titre-modeles"
                >
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

                <section
                    className={styles.actions}
                    aria-labelledby="titre-actions"
                >
                    <h3 id="titre-actions" className={styles.sousTitre}>
                        Nouvelle planification
                    </h3>
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
                </section>
            </div>
            {dialogue}
        </div>
    );
}
