import { useState } from 'react';
import { useEnregistrerModele } from '../../../hooks/useEnregistrerModele';
import type { ModeleDetail } from '../../../types/planning.types';
import { erreurSaisieModele } from '../../../utils/blocsHoraires';
import { ModeleFormActions } from '../ModeleFormActions/ModeleFormActions';
import {
    SaisiePlanification,
    type ValeursSaisie,
} from '../SaisiePlanification/SaisiePlanification';
import styles from './ModeleForm.module.scss';

interface ModeleFormProps {
    technicienId: string;
    // Absent : création d'un nouveau modèle. Présent : ses valeurs préremplies,
    // modifiables (US-02 « Modifier un modèle de planification 2.0 »)
    modele?: ModeleDetail;
    onEnregistre: () => void; // retour à la liste des modèles, rechargée
    onRetour: () => void;
    onSupprimer?: () => void; // en modification : « Supprimer le modèle »
}

/**
 * Formulaire d'un modèle, en création comme en modification, version desktop
 * en deux colonnes (choix de Yannick du 18/11/2026) : à gauche, dans l'ordre
 * des questions (quoi, où, quand) ; à droite, la journée type de 7h à 20h.
 * Pas de période : un modèle n'en a pas (RG3 d'« Administrer les modèles »).
 *
 * En modification, c'est l'écran d'un modèle (écart du 19/11/2026, option A) :
 * l'enregistrement se fait sans fenêtre de confirmation (RG8).
 */
export function ModeleForm({
    technicienId,
    modele,
    onEnregistre,
    onRetour,
    onSupprimer,
}: ModeleFormProps) {
    const { zones, zonesError, enregistrer, isSubmitting, error, setError } =
        useEnregistrerModele(technicienId, modele?.id);
    // Initialisés une fois, au montage : le parent ne rend ce formulaire
    // qu'une fois le modèle chargé
    const [intitule, setIntitule] = useState(modele?.intitule ?? '');
    // Zone, jours et blocs : un seul état, tenu ici et affiché par la saisie
    // partagée (SaisiePlanification)
    const [valeurs, setValeurs] = useState<ValeursSaisie>({
        zoneId: modele?.zoneId ?? '',
        jours: modele?.jours ?? [],
        blocs: modele?.blocs ?? [],
    });
    const enModification = modele !== undefined;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const manque = erreurSaisieModele({ intitule, ...valeurs });
        if (manque) {
            setError(manque);
            return;
        }
        const ok = await enregistrer({
            intitule: intitule.trim(),
            ...valeurs,
        });
        if (ok) onEnregistre();
    };

    return (
        <form onSubmit={handleSubmit} className={styles.wrapper}>
            <button type="button" className={styles.retour} onClick={onRetour}>
                ← Retour
            </button>
            <h2 className={styles.titre}>
                {enModification ? modele.intitule : 'Nouveau modèle'}
            </h2>

            <SaisiePlanification
                zones={zones}
                zonesError={zonesError}
                valeurs={valeurs}
                onChange={setValeurs}
                disabled={isSubmitting}
            >
                {/* Propre au modèle : son titre, en tête de la saisie */}
                <label className={styles.champ}>
                    <span className={styles.label}>Titre</span>
                    <input
                        className={styles.input}
                        value={intitule}
                        maxLength={100}
                        placeholder="Ex : Semaine matin"
                        onChange={(e) => setIntitule(e.target.value)}
                        disabled={isSubmitting}
                    />
                </label>
            </SaisiePlanification>

            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}

            <ModeleFormActions
                enModification={enModification}
                isSubmitting={isSubmitting}
                onAnnuler={onRetour}
                onSupprimer={onSupprimer}
            />
        </form>
    );
}
