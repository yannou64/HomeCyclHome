import { useState, useEffect } from 'react';
import { Footer } from '../shared/components/Footer/Footer';
import { Header } from '../shared/components/Header/Header';
import { HeroBrand } from '../shared/components/HeroBrand/HeroBrand';
import { PageLayout } from '../shared/components/PageLayout/PageLayout';
import { AdresseSelector } from '../features/adresse/components/AdresseSelector/AdresseSelector';
import { CycleEtForfaitForm } from '../features/reservation/components/CycleEtForfaitForm/CycleEtForfaitForm';
import { CreneauSelector } from '../features/reservation/components/CreneauSelector/CreneauSelector';
import { AuthStep } from '../features/reservation/components/AuthStep/AuthStep';
import { RecapitulatifStep } from '../features/reservation/components/RecapitulatifStep/RecapitulatifStep';
import { RestoreCard } from '../features/reservation/components/RestoreCard/RestoreCard';
import { useReservation } from '../app/providers/reservationContext/useReservation';
import { useAuth } from '../app/providers/authContext/useAuth';
import {
    PENDING_RESERVATION_KEY,
    type PendingReservationStorage,
} from '../app/providers/reservationContext/types/reservation.types';

export default function Home() {
    const { currentStep, goToStep, restoreFromStorage } = useReservation();
    const { isAuthenticated } = useAuth();

    const [pendingData, setPendingData] = useState<PendingReservationStorage | null>(null);

    // Détecte une réservation en attente dans le localStorage lorsqu'un utilisateur
    // vient de se connecter. Affiche une bannière de confirmation plutôt que de
    // restaurer silencieusement (protection appareils partagés).
    useEffect(() => {
        if (!isAuthenticated) return;
        // Autorisé depuis 'adresse' (détection normale) ET depuis 'auth'
        // (retour après connexion — currentStep persiste dans le context React)
        if (currentStep !== 'adresse' && currentStep !== 'auth') return;

        void (async () => {
            const raw = localStorage.getItem(PENDING_RESERVATION_KEY);

            if (!raw) {
                // Aucune donnée en attente : si on vient de AuthStep, on repart à zéro
                if (currentStep === 'auth') goToStep('adresse');
                return;
            }

            try {
                const data = JSON.parse(raw) as PendingReservationStorage;
                if (!data.adresse || !data.zone || !data.cycle || !data.forfait || !data.creneau) {
                    localStorage.removeItem(PENDING_RESERVATION_KEY);
                    if (currentStep === 'auth') goToStep('adresse');
                    return;
                }
                // Données valides : on repasse à 'adresse' si besoin, puis on affiche RestoreCard
                if (currentStep === 'auth') goToStep('adresse');
                setPendingData(data);
            } catch {
                localStorage.removeItem(PENDING_RESERVATION_KEY);
                if (currentStep === 'auth') goToStep('adresse');
            }
        })();
    }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRestoreConfirm = () => {
        if (!pendingData) return;
        restoreFromStorage(pendingData);
        localStorage.removeItem(PENDING_RESERVATION_KEY); // données dans le context, clé inutile
        goToStep('confirmation');
        setPendingData(null);
    };

    const handleRestoreDecline = () => {
        localStorage.removeItem(PENDING_RESERVATION_KEY);
        setPendingData(null);
    };

    return (
        <>
            <Header />
            <PageLayout
                leftContent={<HeroBrand />}
                compact={currentStep !== 'adresse' || pendingData !== null}
                noContentScroll={currentStep === 'creneau'}
            >
                {pendingData ? (
                    <RestoreCard
                        pendingData={pendingData}
                        onConfirm={handleRestoreConfirm}
                        onDecline={handleRestoreDecline}
                    />
                ) : (
                    <>
                        {currentStep === 'adresse'      && <AdresseSelector />}
                        {currentStep === 'cycle'        && <CycleEtForfaitForm />}
                        {currentStep === 'creneau'      && <CreneauSelector />}
                        {currentStep === 'auth'         && !isAuthenticated && <AuthStep />}
                        {currentStep === 'confirmation' && <RecapitulatifStep />}
                    </>
                )}
            </PageLayout>
            <Footer />
        </>
    );
}
