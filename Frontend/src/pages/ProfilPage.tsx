import { Header } from '../shared/components/Header/Header';
import { PageLayout } from '../shared/components/PageLayout/PageLayout';
import { Footer } from '../shared/components/Footer/Footer';
import { Card } from '../shared/components/Card/Card';
import { ProfileForm } from '../features/user/components/ProfileForm/ProfileForm';
import { DeleteAccountSection } from '../features/user/components/DeleteAccountSection/DeleteAccountSection';
import { MesCycles } from '../features/cycle/components/MesCycles/MesCycles';

export default function ProfilPage() {
    return (
        <>
            <Header />
            <PageLayout>
                <Card>
                    <ProfileForm />
                </Card>
                <Card>
                    <MesCycles />
                </Card>
                <DeleteAccountSection />
            </PageLayout>
            <Footer />
        </>
    );
}
