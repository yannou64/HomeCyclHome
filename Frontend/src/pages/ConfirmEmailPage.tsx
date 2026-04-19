import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../shared/services/apiClient';
import { Header } from '../shared/components/Header/Header';
import { PageLayout } from '../shared/components/PageLayout/PageLayout';
import { Footer } from '../shared/components/Footer/Footer';

export default function ConfirmEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
        token ? 'loading' : 'error',
    );
    const called = useRef(false);

    useEffect(() => {
        if (!token || called.current) return;
        called.current = true; // verrou : un seul appel possible

        apiClient
            .get('/auth/confirm-email', { params: { token } })
            .then(() => setStatus('success'))
            .catch(() => setStatus('error'));
    }, [token]);

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
