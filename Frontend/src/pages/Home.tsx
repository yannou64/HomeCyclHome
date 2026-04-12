import { LoginForm } from '../features/auth/components/LoginForm/LoginForm';
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
                <LoginForm />
            </PageLayout>
            <Footer />
        </>
    );
}
