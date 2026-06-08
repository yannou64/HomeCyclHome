import { Footer } from '../shared/components/Footer/Footer';
import { Header } from '../shared/components/Header/Header';
import { HeroBrand } from '../shared/components/HeroBrand/HeroBrand';
import { PageLayout } from '../shared/components/PageLayout/PageLayout';
import { AdresseSelector } from '../features/adresse/components/AdresseSelector/AdresseSelector';
import { CycleEtForfaitForm } from '../features/reservation/components/CycleEtForfaitForm/CycleEtForfaitForm';
import { CreneauSelector } from '../features/reservation/components/CreneauSelector/CreneauSelector';
import { useReservation } from '../app/providers/reservationContext/useReservation';

export default function Home() {
    const { currentStep } = useReservation();

    return (
        <>
            <Header />
            <PageLayout>
                <HeroBrand />
                {currentStep === 'adresse' && <AdresseSelector />}
                {currentStep === 'cycle' && <CycleEtForfaitForm />}
                {currentStep === 'creneau' && <CreneauSelector />}
            </PageLayout>
            <Footer />
        </>
    );
}
