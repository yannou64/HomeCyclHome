import { useState } from 'react';
import { useEnregistrerModele } from '../../../hooks/useEnregistrerModele';
import { useGenererCreneaux } from '../../../hooks/useGenererCreneaux';
import type {
    EcranPlanification,
    ModeleDetail,
    Periode,
} from '../../../types/planning.types';
import {
    erreurSaisieModele,
    erreurSaisiePlanification,
} from '../../../utils/blocsHoraires';
import { messageResultat } from '../../../utils/messagePlanification';
import { IntituleChamp } from '../IntituleChamp/IntituleChamp';
import { PeriodeChoix } from '../PeriodeChoix/PeriodeChoix';
import { PlanificationActions } from '../PlanificationActions/PlanificationActions';
import { ReinitialiserPeriodeDialog } from '../ReinitialiserPeriodeDialog/ReinitialiserPeriodeDialog';
import {
    SaisiePlanification,
    type ValeursSaisie,
} from '../SaisiePlanification/SaisiePlanification';
import styles from './PlanificationForm.module.scss';

interface PlanificationFormProps {
    technicienId: string;
    ecran: EcranPlanification; // demain et zones proposées, déjà chargés
    // Présent : écran d'un modèle, prérempli. Absent : planification libre.
    modele?: ModeleDetail;
    onRetour: () => void;
    onSupprimerModele: () => void;
}

/**
 * Écran de planification d'un technicien (« Planifier un technicien 2.0 ») :
 * la période en tête (choix de Yannick du 23/11/2026), puis la saisie
 * partagée (zone, jours, blocs) et la journée type.
 *
 * - Planification libre : tout est vide, aucun modèle (US-01, CA09).
 * - Écran d'un modèle : ses valeurs préremplies et modifiables pour cette
 *   planification sans toucher au modèle ; « Modifier le modèle » les
 *   enregistre dans le modèle, sans confirmation (RG12).
 * - Dans les deux cas, « Générer les créneaux » (US-03) : avertissement si
 *   la période a déjà des créneaux, puis remplacement.
 *
 * Rendu seulement une fois l'écran (et le modèle) chargés : les états
 * s'initialisent au montage avec ces valeurs, sans effet.
 */
export function PlanificationForm({
    technicienId,
    ecran,
    modele,
    onRetour,
    onSupprimerModele,
}: PlanificationFormProps) {
    const enregistrement = useEnregistrerModele(technicienId, modele?.id);
    const generation = useGenererCreneaux(technicienId);
    const isSubmitting = enregistrement.isSubmitting || generation.isSubmitting;
    const error = enregistrement.error ?? generation.error;
    // Message affiché après une action réussie : l'admin reste sur l'écran
    // (« Modifié, sans fenêtre » ; « Créneaux générés »)
    const [confirmation, setConfirmation] = useState<string | null>(null);

    // RG6 : début prérempli avec demain (calculé par l'API), fin vide (CA04)
    const [periode, setPeriode] = useState<Periode>({
        dateDebut: ecran.demain,
        dateFin: '',
    });
    const [intitule, setIntitule] = useState(modele?.intitule ?? '');
    const [valeurs, setValeurs] = useState<ValeursSaisie>(() => ({
        // RG4 : un technicien affecté à une seule zone l'a présélectionnée
        // (CA05) ; un modèle garde la sienne (CA07 de l'US-01)
        zoneId:
            modele?.zoneId ??
            (ecran.zones.length === 1 ? ecran.zones[0].id : ''),
        jours: modele?.jours ?? [],
        blocs: modele?.blocs ?? [],
    }));

    // Toute nouvelle saisie efface les messages de l'action précédente
    const reinitialiserMessages = () => {
        setConfirmation(null);
        enregistrement.setError(null);
        generation.setError(null);
    };
    const changerValeurs = (v: ValeursSaisie) => {
        setValeurs(v);
        reinitialiserMessages();
    };

    const modifierModele = async () => {
        reinitialiserMessages();
        const manque = erreurSaisieModele({ intitule, ...valeurs });
        if (manque) {
            enregistrement.setError(manque);
            return;
        }
        // Mêmes validations et même route qu'une modification ordinaire
        // (CA16 de « Modifier un modèle »)
        const ok = await enregistrement.enregistrer({
            intitule: intitule.trim(),
            ...valeurs,
        });
        if (ok) setConfirmation('Le modèle est modifié.');
    };

    // « Générer les créneaux » : aperçu, puis génération directe si la
    // période est vide, sinon la fenêtre d'avertissement s'ouvre (RG10)
    const generer = async () => {
        reinitialiserMessages();
        const saisie = { ...periode, ...valeurs };
        const manque = erreurSaisiePlanification(saisie);
        if (manque) {
            generation.setError(manque);
            return;
        }
        const resultat = await generation.demander(saisie);
        if (resultat) setConfirmation(messageResultat(resultat));
    };

    // « Réinitialiser et générer » dans la fenêtre ; une erreur y reste
    const confirmerGeneration = async () => {
        const resultat = await generation.confirmer();
        setConfirmation(messageResultat(resultat));
    };

    return (
        <div className={styles.wrapper}>
            {/* Règles d'interface : « ← Retour » en haut à gauche */}
            <button type="button" className={styles.retour} onClick={onRetour}>
                ← Retour
            </button>
            <h2 className={styles.titre}>
                {modele ? modele.intitule : 'Planification libre'}
            </h2>

            <SaisiePlanification
                zones={ecran.zones}
                zonesError={null}
                valeurs={valeurs}
                onChange={changerValeurs}
                disabled={isSubmitting}
            >
                <PeriodeChoix
                    valeur={periode}
                    onChange={setPeriode}
                    demain={ecran.demain}
                    disabled={isSubmitting}
                />
                {/* Le titre n'existe que pour un modèle */}
                {modele && (
                    <IntituleChamp
                        valeur={intitule}
                        onChange={setIntitule}
                        disabled={isSubmitting}
                    />
                )}
            </SaisiePlanification>

            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}
            {confirmation && (
                <p className={styles.confirmation} role="status">
                    {confirmation}
                </p>
            )}

            {/* Boutons de modèle : seulement sur l'écran d'un modèle (CA08,
                CA09 de l'US-01) ; « Générer » partout */}
            <PlanificationActions
                isSubmitting={isSubmitting}
                onGenerer={generer}
                onModifierModele={modele ? modifierModele : undefined}
                onSupprimerModele={modele ? onSupprimerModele : undefined}
            />

            <ReinitialiserPeriodeDialog
                avertissement={generation.avertissement}
                onAnnuler={generation.annuler}
                onConfirmer={confirmerGeneration}
            />
        </div>
    );
}
