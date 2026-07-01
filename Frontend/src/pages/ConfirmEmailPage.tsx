import { useSearchParams, Link } from 'react-router-dom';
import { useConfirmEmail } from '../features/auth/hooks/useConfirmEmail';
import { Header } from '../shared/components/Header/Header';
import { PageLayout } from '../shared/components/PageLayout/PageLayout';
import { Footer } from '../shared/components/Footer/Footer';

export default function ConfirmEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { status } = useConfirmEmail(token);

    return (
        <>
            <Header />
            <PageLayout>
                {status === 'loading' && <p>Confirmation en cours...</p>}
                {status === 'success' && (
                    <>
                        <p>
                            Ton email est confirmé ! Tu peux maintenant te
                            connecter.
                        </p>
                        <Link to="/login">Se connecter</Link>
                    </>
                )}
                {status === 'error' && (
                    <p>Ce lien est invalide ou expiré. Réinscris-toi.</p>
                )}
            </PageLayout>
            <Footer />
        </>
    );
}
