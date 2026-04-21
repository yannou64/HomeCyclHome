import { Link, NavLink } from 'react-router-dom';
import logoMiniRondWhite from '../../../../assets/images/logoMiniRondWhite.webp';
import styles from './MobileMenu.module.scss';

type NavLinkItem = { label: string; to: string };

type MobileMenuProps = {
    isOpen: boolean;
    onClose: () => void;
    navLinks: NavLinkItem[];
    onLogout?: () => void;
    isAuthenticated: boolean;
};

const LEGAL_LINKS: NavLinkItem[] = [
    { label: 'Mentions légales', to: '/mentions-legales' },
    { label: 'CGU', to: '/cgu' },
    { label: 'Confidentialité', to: '/confidentialite' },
];

export function MobileMenu({ isOpen, onClose, navLinks, onLogout, isAuthenticated }: MobileMenuProps) {
    return (
        <>
            {/* Fond semi-transparent — clic pour fermer */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer slide depuis la droite */}
            <nav
                className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
                aria-hidden={!isOpen}
                role="dialog"
                aria-label="Menu de navigation"
            >
                {/* En-tête du drawer : logo + bouton fermer */}
                <div className={styles.drawerHeader}>
                    <Link to="/" onClick={onClose}>
                        <img src={logoMiniRondWhite} alt="HomeCycl'Home" className={styles.logo} />
                    </Link>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Fermer le menu"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Liens de navigation principaux */}
                <ul className={styles.navList}>
                    {navLinks.map((link) => (
                        <li key={link.to}>
                            <NavLink
                                to={link.to}
                                className={({ isActive }) =>
                                    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                                }
                                onClick={onClose}
                                end={link.to === '/'}
                            >
                                {link.label}
                            </NavLink>
                        </li>
                    ))}
                    {isAuthenticated && (
                        <li>
                            <button
                                className={styles.logoutBtn}
                                onClick={() => { onLogout?.(); onClose(); }}
                            >
                                Déconnexion
                            </button>
                        </li>
                    )}
                </ul>

                <div className={styles.separator} />

                {/* Liens légaux */}
                <ul className={styles.legalList}>
                    {LEGAL_LINKS.map((link) => (
                        <li key={link.to}>
                            <Link to={link.to} className={styles.legalLink} onClick={onClose}>
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
}
