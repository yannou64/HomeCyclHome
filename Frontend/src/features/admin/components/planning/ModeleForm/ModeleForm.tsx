import { useState } from 'react';
import { useEnregistrerModele } from '../../../hooks/useEnregistrerModele';
import type {
    BlocHoraire,
    JourSemaine,
    ModeleDetail,
} from '../../../types/planning.types';
import { erreurSaisieModele } from '../../../utils/blocsHoraires';
import {
    GRIS_ZONE_INACTIVE,
    hexDeCouleur,
} from '../../../../../shared/utils/couleursZones';
import { BlocsHorairesEditeur } from '../BlocsHorairesEditeur/BlocsHorairesEditeur';
import { FriseJournee } from '../FriseJournee/FriseJournee';
import { JoursSemaineChoix } from '../JoursSemaineChoix/JoursSemaineChoix';
import { ModeleFormActions } from '../ModeleFormActions/ModeleFormActions';
import { ZoneChoix } from '../ZoneChoix/ZoneChoix';
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
    const [zoneId, setZoneId] = useState(modele?.zoneId ?? '');
    const [jours, setJours] = useState<JourSemaine[]>(modele?.jours ?? []);
    const [blocs, setBlocs] = useState<BlocHoraire[]>(modele?.blocs ?? []);

    const zone = zones.find((z) => z.id === zoneId);
    const couleur = zone ? hexDeCouleur(zone.couleur) : GRIS_ZONE_INACTIVE;
    const enModification = modele !== undefined;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const manque = erreurSaisieModele({ intitule, zoneId, jours, blocs });
        if (manque) {
            setError(manque);
            return;
        }
        const ok = await enregistrer({
            intitule: intitule.trim(),
            zoneId,
            jours,
            blocs,
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

            <div className={styles.colonnes}>
                <div className={styles.formulaire}>
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

                    <ZoneChoix
                        zones={zones}
                        valeur={zoneId}
                        couleur={couleur}
                        onChange={setZoneId}
                        erreur={zonesError}
                        disabled={isSubmitting}
                    />
                    <JoursSemaineChoix
                        valeur={jours}
                        onChange={setJours}
                        disabled={isSubmitting}
                    />
                    <BlocsHorairesEditeur
                        valeur={blocs}
                        onChange={setBlocs}
                        disabled={isSubmitting}
                    />
                </div>

                <aside
                    className={styles.apercu}
                    aria-label="Aperçu de la journée type"
                >
                    <p className={styles.label}>Journée type</p>
                    <FriseJournee blocs={blocs} couleur={couleur} />
                </aside>
            </div>

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
