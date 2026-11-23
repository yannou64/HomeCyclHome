import { useState } from 'react';
import { useEnregistrerModele } from '../../../hooks/useEnregistrerModele';
import type {
    EcranPlanification,
    ModeleDetail,
    Periode,
} from '../../../types/planning.types';
import { erreurSaisieModele } from '../../../utils/blocsHoraires';
import { IntituleChamp } from '../IntituleChamp/IntituleChamp';
import { PeriodeChoix } from '../PeriodeChoix/PeriodeChoix';
import { PlanificationActions } from '../PlanificationActions/PlanificationActions';
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
    const { enregistrer, isSubmitting, error, setError } = useEnregistrerModele(
        technicienId,
        modele?.id,
    );
    // Message affiché après « Modifier le modèle » : l'admin reste sur
    // l'écran, pour générer ensuite s'il le veut (séquence : « Modifié, sans
    // fenêtre »)
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

    // Toute nouvelle saisie efface le message de l'action précédente
    const changerValeurs = (v: ValeursSaisie) => {
        setValeurs(v);
        setConfirmation(null);
    };

    const modifierModele = async () => {
        setConfirmation(null);
        const manque = erreurSaisieModele({ intitule, ...valeurs });
        if (manque) {
            setError(manque);
            return;
        }
        // Mêmes validations et même route qu'une modification ordinaire
        // (CA16 de « Modifier un modèle »)
        const ok = await enregistrer({ intitule: intitule.trim(), ...valeurs });
        if (ok) setConfirmation('Le modèle est modifié.');
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
                CA09 de l'US-01) */}
            {modele && (
                <PlanificationActions
                    isSubmitting={isSubmitting}
                    onModifierModele={modifierModele}
                    onSupprimerModele={onSupprimerModele}
                />
            )}
        </div>
    );
}
