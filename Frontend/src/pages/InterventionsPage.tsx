import { Header } from '../shared/components/Header/Header';
import { PageLayout } from '../shared/components/PageLayout/PageLayout';
import { Footer } from '../shared/components/Footer/Footer';
import { Card } from '../shared/components/Card/Card';
import { MesInterventions } from '../features/intervention/components/MesInterventions/MesInterventions';

export default function InterventionsPage() {
    return (
        <>
            <Header />
            <PageLayout>
                <Card>
                    <MesInterventions />
                </Card>
            </PageLayout>
            <Footer />
        </>
    );
}
