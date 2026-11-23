import { useState } from 'react';
import { useEnregistrerModele } from '../../../hooks/useEnregistrerModele';
import { useZonesProposees } from '../../../hooks/useZonesProposees';
import { erreurSaisieModele } from '../../../utils/blocsHoraires';
import { IntituleChamp } from '../IntituleChamp/IntituleChamp';
import { ModeleFormActions } from '../ModeleFormActions/ModeleFormActions';
import {
    SaisiePlanification,
    type ValeursSaisie,
} from '../SaisiePlanification/SaisiePlanification';
import styles from './ModeleForm.module.scss';

interface ModeleFormProps {
    technicienId: string;
    onEnregistre: () => void; // retour à la liste des modèles, rechargée
    onRetour: () => void;
}

/**
 * Formulaire de création d'un modèle (US-01 « Créer un modèle de
 * planification 2.0 »), version desktop en deux colonnes (choix de Yannick du
 * 18/11/2026). Pas de période : un modèle n'en a pas.
 *
 * Un modèle existant s'ouvre sur l'écran de planification prérempli
 * (EcranPlanification), qui porte « Modifier le modèle » et « Supprimer le
 * modèle » (écart du 19/11/2026, option A).
 */
export function ModeleForm({
    technicienId,
    onEnregistre,
    onRetour,
}: ModeleFormProps) {
    const { zones, zonesError } = useZonesProposees(technicienId);
    const { enregistrer, isSubmitting, error, setError } =
        useEnregistrerModele(technicienId);
    const [intitule, setIntitule] = useState('');
    // Zone, jours et blocs : un seul état, affiché par la saisie partagée
    const [valeurs, setValeurs] = useState<ValeursSaisie>({
        zoneId: '',
        jours: [],
        blocs: [],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const manque = erreurSaisieModele({ intitule, ...valeurs });
        if (manque) {
            setError(manque);
            return;
        }
        const ok = await enregistrer({ intitule: intitule.trim(), ...valeurs });
        if (ok) onEnregistre();
    };

    return (
        <form onSubmit={handleSubmit} className={styles.wrapper}>
            <button type="button" className={styles.retour} onClick={onRetour}>
                ← Retour
            </button>
            <h2 className={styles.titre}>Nouveau modèle</h2>

            <SaisiePlanification
                zones={zones}
                zonesError={zonesError}
                valeurs={valeurs}
                onChange={setValeurs}
                disabled={isSubmitting}
            >
                <IntituleChamp
                    valeur={intitule}
                    onChange={setIntitule}
                    disabled={isSubmitting}
                />
            </SaisiePlanification>

            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}

            <ModeleFormActions
                isSubmitting={isSubmitting}
                onAnnuler={onRetour}
            />
        </form>
    );
}
