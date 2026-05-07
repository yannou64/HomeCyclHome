import styles from './AdminSidebar.module.scss';

export type AdminSection =
    | 'dashboard'
    | 'utilisateurs'
    | 'cycles'
    | 'zones'
    | 'affectations'
    | 'forfaits'
    | 'creneaux'
    | 'planning'
    | 'interventions';

const MENU_ITEMS: { label: string; section: AdminSection }[] = [
    { label: 'Dashboard', section: 'dashboard' },
    { label: 'Utilisateurs', section: 'utilisateurs' },
    { label: 'Cycles', section: 'cycles' },
    { label: 'Zones', section: 'zones' },
    { label: 'Affectations', section: 'affectations' },
    { label: 'Forfaits', section: 'forfaits' },
    { label: 'Créneaux', section: 'creneaux' },
    { label: 'Planning', section: 'planning' },
    { label: 'Interventions', section: 'interventions' },
];

interface AdminSidebarProps {
    activeSection: AdminSection;
    onSectionChange: (section: AdminSection) => void;
}

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
    return (
        <aside className={styles.sidebar} aria-label="Menu d'administration">
            <nav>
                <ul className={styles.menu}>
                    {MENU_ITEMS.map(({ label, section }) => (
                        <li key={section}>
                            <button
                                className={`${styles.menuItem} ${activeSection === section ? styles.active : ''}`}
                                onClick={() => onSectionChange(section)}
                                aria-current={activeSection === section ? 'page' : undefined}
                            >
                                {label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
