import { Footer } from '../shared/components/Footer/Footer';
import { Header } from '../shared/components/Header/Header';
import { HeroBrand } from '../shared/components/HeroBrand/HeroBrand';
import { PageLayout } from '../shared/components/PageLayout/PageLayout';

export default function Home() {
    return (
        <>
            <Header />
            <PageLayout>
                <HeroBrand />
                <h1>Features Soon !</h1>

            </PageLayout>
            <Footer />
        </>
    );
}
