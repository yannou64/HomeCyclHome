import { Footer } from '../shared/components/Footer/Footer';
import { Header } from '../shared/components/Header/Header';
import { HeroBrand } from '../shared/components/HeroBrand/HeroBrand';
import { PageLayout } from '../shared/components/PageLayout/PageLayout';
import { AdresseSelector } from '../features/adresse/components/AdresseSelector/AdresseSelector';

export default function Home() {
    return (
        <>
            <Header />
            <PageLayout>
                <HeroBrand />
                <AdresseSelector />
            </PageLayout>
            <Footer />
        </>
    );
}
