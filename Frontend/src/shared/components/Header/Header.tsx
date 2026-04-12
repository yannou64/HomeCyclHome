import { useState, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../../app/providers/authContext/useAuth';
import { MobileMenu } from './MobileMenu/MobileMenu';
import logoMiniRondWhite from '../../../assets/images/logoMiniRondWhite.webp';
import styles from './Header.module.scss';

type NavLinkItem = { label: string; to: string };

export function Header() {
    const { session, isAuthenticated, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Calcule les liens de navigation selon le rôle de l'utilisateur
    const navLinks = useMemo<NavLinkItem[]>(() => {
        if (!isAuthenticated) {
            return [
                { label: 'Accueil', to: '/' },
                { label: 'Se Connecter', to: '/login' },
                { label: "S'inscrire", to: '/inscription' },
            ];
        }

        if (session?.role === 'admin') {
            return [
                { label: 'Accueil', to: '/' },
                { label: 'Administration', to: '/admin' },
                { label: 'Mon profil', to: '/profil' },
            ];
        }

        // client & technicien
        return [
            { label: 'Accueil', to: '/' },
            { label: 'Mes interventions', to: '/interventions' },
            { label: 'Mon profil', to: '/profil' },
        ];
    }, [isAuthenticated, session?.role]);

    return (
        <>
            <header className={styles.header}>
                <div className={styles.inner}>
                    {/* Logo */}
                    <Link to="/" aria-label="Retour à l'accueil">
                        <img src={logoMiniRondWhite} alt="HomeCycl'Home" className={styles.logo} />
                    </Link>

                    {/* Navigation desktop — masquée sur mobile */}
                    <nav className={styles.desktopNav} aria-label="Navigation principale">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                                }
                                end={link.to === '/'}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                        {isAuthenticated && (
                            <button className={styles.logoutBtn} onClick={logout}>
                                Déconnexion
                            </button>
                        )}
                    </nav>

                    {/* Bouton hamburger — masqué sur desktop */}
                    <button
                        className={styles.hamburger}
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Ouvrir le menu"
                        aria-expanded={isMenuOpen}
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Menu mobile drawer */}
            <MobileMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                navLinks={navLinks}
                onLogout={logout}
                isAuthenticated={isAuthenticated}
            />
        </>
    );
}
