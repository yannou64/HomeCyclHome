import { AdminMobileBlocker } from '../features/admin/components/AdminMobileBlocker/AdminMobileBlocker';
import { AdminLayout } from '../features/admin/components/AdminLayout/AdminLayout';
import { Header } from '../shared/components/Header/Header';
import { Footer } from '../shared/components/Footer/Footer';
import { useIsMobile } from '../shared/hooks/useIsMobile';

export default function AdminPage() {
    const isMobile = useIsMobile();

    return (
        <>
            <Header />
            {isMobile ? <AdminMobileBlocker /> : <AdminLayout />}
            <Footer />
        </>
    );
}
