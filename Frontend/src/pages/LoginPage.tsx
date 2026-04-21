import { Header } from '../shared/components/Header/Header';
import { PageLayout } from '../shared/components/PageLayout/PageLayout';
import { Footer } from '../shared/components/Footer/Footer';
import { LoginForm } from '../features/auth/components/LoginForm/LoginForm';
import { Card } from '../shared/components/Card/Card';

export default function LoginPage() {
    return (
        <>
            <Header />
            <PageLayout>
                <Card>
                    <LoginForm />
                </Card>
            </PageLayout>
            <Footer />
        </>
    );
}
