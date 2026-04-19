import { Header } from '../shared/components/Header/Header';
import { PageLayout } from '../shared/components/PageLayout/PageLayout';
import { Footer } from '../shared/components/Footer/Footer';
import { RegisterForm } from '../features/auth/components/RegisterForm/RegisterForm';
import { Card } from '../shared/components/Card/Card';

export default function RegisterPage() {
    return (
        <>
            <Header />
            <PageLayout>
                <Card>
                    <RegisterForm />
                </Card>
            </PageLayout>
            <Footer />
        </>
    );
}
