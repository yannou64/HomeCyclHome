import { Header } from '../shared/components/Header/Header';
import { PageLayout } from '../shared/components/PageLayout/PageLayout';
import { Footer } from '../shared/components/Footer/Footer';
import { Card } from '../shared/components/Card/Card';
import { ProfileForm } from '../features/user/components/ProfileForm/ProfileForm';

export default function ProfilPage() {
    return (
        <>
            <Header />
            <PageLayout>
                <Card>
                    <ProfileForm />
                </Card>
            </PageLayout>
            <Footer />
        </>
    );
}
