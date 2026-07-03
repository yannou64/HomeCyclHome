import { useState } from 'react';
import { useAuth } from '../../../../app/providers/authContext/useAuth';
import { useReservation } from '../../../../app/providers/reservationContext/useReservation';
import type {
    CycleBooking,
    ForfaitInfo,
} from '../../../../app/providers/reservationContext/types/reservation.types';
import { CycleSelector } from '../../../cycle/components/CycleSelector/CycleSelector';
import { ForfaitSelector } from '../../../forfait/components/ForfaitSelector/ForfaitSelector';
import { CTAButton } from '../../../../shared/components/CTAButton/CTAButton';
import { Form } from '../../../../shared/components/Form/Form';
import { useReferentiel } from '../../../cycle/hooks/useReferentiel';
import { useForfaits } from '../../hooks/useForfaits';
import { useUserCyclesForReservation } from '../../hooks/useUserCyclesForReservation';
import styles from './CycleEtForfaitForm.module.scss';

export function CycleEtForfaitForm() {
    const { isAuthenticated } = useAuth();
    const { setCycle, setForfait, goToStep } = useReservation();

    const { marques, typesCycles, isLoading: refLoading } = useReferentiel();
    const { forfaits, isLoading: forfaitsLoading, error: forfaitsError } = useForfaits();
    const { cycles, isLoading: cyclesLoading } = useUserCyclesForReservation(isAuthenticated);

    const [selectedCycle, setSelectedCycle] = useState<CycleBooking | null>(null);
    const [selectedForfait, setSelectedForfait] = useState<ForfaitInfo | null>(null);

    // On attend aussi les cycles si l'utilisateur est connecté
    const isLoading = refLoading || forfaitsLoading || (isAuthenticated && cyclesLoading);
    const canSubmit = !!selectedCycle && !!selectedForfait;

    const handleSubmit = () => {
        if (!canSubmit) return;
        setCycle(selectedCycle);
        setForfait(selectedForfait);
        goToStep('creneau');
    };

    if (isLoading) {
        return <p className={styles.loadingText}>Chargement...</p>;
    }

    return (
        <Form className={styles.container} onSubmit={handleSubmit}>
            <h2 className={styles.sectionTitle}>Votre vélo et votre prestation</h2>

            <CycleSelector
                typesCycles={typesCycles}
                marques={marques}
                userCycles={isAuthenticated ? cycles : undefined}
                onChange={setSelectedCycle}
            />

            <div className={styles.forfaitSection}>
                <span className={styles.forfaitLabel}>Choisissez votre forfait</span>
                {forfaitsError ? (
                    <p className={styles.errorText}>{forfaitsError}</p>
                ) : (
                    <ForfaitSelector forfaits={forfaits} onChange={setSelectedForfait} />
                )}
            </div>

            <div className={styles.actions}>
                <CTAButton type="submit" disabled={!canSubmit}>
                    Choisir un créneau
                </CTAButton>
                <button type="button" className={styles.backButton} onClick={() => goToStep('adresse')}>
                    Retour
                </button>
            </div>
        </Form>
    );
}
