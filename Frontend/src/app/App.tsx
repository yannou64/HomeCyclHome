import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './router/ProtectedRoute';

const Home = lazy(() => import('../pages/Home'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ConfirmEmailPage = lazy(() => import('../pages/ConfirmEmailPage'));
const ProfilPage = lazy(() => import('../pages/ProfilPage'));
const AdminPage = lazy(() => import('../pages/AdminPage'));
const MentionsLegalesPage = lazy(() => import('../pages/MentionsLegalesPage'));
const CguPage = lazy(() => import('../pages/CguPage'));
const ConfidentialitePage = lazy(() => import('../pages/ConfidentialitePage'));
const InterventionsPage = lazy(() => import('../pages/InterventionsPage'));

function App() {
    return (
        <Suspense fallback={null}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/inscription" element={<RegisterPage />} />
                <Route path="/confirmer-email" element={<ConfirmEmailPage />} />
                <Route path="/profil" element={
                    <ProtectedRoute>
                        <ProfilPage />
                    </ProtectedRoute>
                } />
                <Route path="/interventions" element={
                    <ProtectedRoute>
                        <InterventionsPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <ProtectedRoute roles={['admin']}>
                        <AdminPage />
                    </ProtectedRoute>
                } />
                <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
                <Route path="/cgu" element={<CguPage />} />
                <Route path="/confidentialite" element={<ConfidentialitePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}

export default App;
