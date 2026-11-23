import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import { getApiErrorMessage } from '../../../../../shared/utils/apiError';
import type { Avertissement } from '../../../hooks/useGenererCreneaux';
import { formaterJour } from '../../../utils/jourCalendrier';
import styles from './ReinitialiserPeriodeDialog.module.scss';

interface ReinitialiserPeriodeDialogProps {
    avertissement: Avertissement | null; // null : fenêtre fermée
    onAnnuler: () => void; // rien n'est modifié (CA05)
    onConfirmer: () => Promise<void>; // remplace et génère (CA06)
}

/** « 1 créneau supprimé », « 3 créneaux supprimés » : accord avec le nombre. */
const compter = (n: number, singulier: string, pluriel: string) =>
    `${n} ${n > 1 ? pluriel : singulier}`;

/**
 * Avertissement avant la réinitialisation de la période (US-03, RG10) : tous
 * les créneaux de la période sont remplacés, avec le nombre de créneaux
 * supprimés et d'interventions touchées. Rien n'est appliqué sans
 * confirmation.
 */
export function ReinitialiserPeriodeDialog({
    avertissement,
    onAnnuler,
    onConfirmer,
}: ReinitialiserPeriodeDialogProps) {
    return (
        <Dialog
            open={avertissement !== null}
            onOpenChange={(open) => !open && onAnnuler()}
        >
            <DialogContent className={styles.content}>
                {avertissement && (
                    <>
                        <DialogHeader>
                            <DialogTitle className={styles.title}>
                                Réinitialiser la période
                            </DialogTitle>
                            <DialogDescription className={styles.message}>
                                Tous les créneaux du technicien du{' '}
                                {formaterJour(avertissement.saisie.dateDebut)}{' '}
                                au {formaterJour(avertissement.saisie.dateFin)}{' '}
                                seront réinitialisés, y compris les jours non
                                choisis :{' '}
                                {compter(
                                    avertissement.creneauxSupprimes,
                                    'créneau supprimé',
                                    'créneaux supprimés',
                                )}
                                ,{' '}
                                {compter(
                                    avertissement.interventionsTouchees,
                                    'intervention touchée',
                                    'interventions touchées',
                                )}
                                .
                                {avertissement.interventionsTouchees > 0 && (
                                    <>
                                        <br />
                                        Les interventions planifiées concernées
                                        passeront en conflit.
                                    </>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <ReinitialiserPeriodeContenu
                            onAnnuler={onAnnuler}
                            onConfirmer={onConfirmer}
                        />
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

interface ReinitialiserPeriodeContenuProps {
    onAnnuler: () => void;
    onConfirmer: () => Promise<void>;
}

// Rendu dans <DialogContent>, que Radix démonte à la fermeture : l'erreur et
// l'envoi repartent à zéro à chaque ouverture (Frontend/CLAUDE.md, section 5)
function ReinitialiserPeriodeContenu({
    onAnnuler,
    onConfirmer,
}: ReinitialiserPeriodeContenuProps) {
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleConfirm = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            await onConfirmer(); // le parent ferme la fenêtre et confirme
        } catch (err) {
            // Refus (planning modifié entre-temps…) : la fenêtre reste
            // ouverte et affiche le message de l'API
            setError(getApiErrorMessage(err, 'Une erreur est survenue.'));
            setIsGenerating(false);
        }
    };

    return (
        <>
            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}
            {/* « Annuler » juste à gauche du bouton principal */}
            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.boutonSecondaire}
                    onClick={onAnnuler}
                    disabled={isGenerating}
                >
                    Annuler
                </button>
                <button
                    type="button"
                    className={styles.boutonDanger}
                    onClick={handleConfirm}
                    disabled={isGenerating}
                >
                    {isGenerating ? 'Génération…' : 'Réinitialiser et générer'}
                </button>
            </div>
        </>
    );
}
