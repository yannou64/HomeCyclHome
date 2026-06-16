import { CalendarCheck, MapPin, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAdminDashboard } from '../../../hooks/useAdminDashboard';
import styles from './AdminDashboardSection.module.scss';

const STAT_CARDS: {
    key: 'interventionsPlanifiees' | 'zonesCouvertes' | 'nombreTechniciens';
    label: string;
    Icon: LucideIcon;
    colorClass: string;
}[] = [
    {
        key: 'interventionsPlanifiees',
        label: 'Interventions planifiées',
        Icon: CalendarCheck,
        colorClass: 'colorBrown',
    },
    {
        key: 'zonesCouvertes',
        label: 'Zones couvertes',
        Icon: MapPin,
        colorClass: 'colorViolet',
    },
    {
        key: 'nombreTechniciens',
        label: 'Techniciens actifs',
        Icon: Wrench,
        colorClass: 'colorYellow',
    },
];

export function AdminDashboardSection() {
    const { stats, isLoading, error } = useAdminDashboard();

    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>Tableau de bord</h1>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.grid}>
                {STAT_CARDS.map(({ key, label, Icon, colorClass }) => (
                    <div key={key} className={styles.card}>
                        <Icon className={`${styles.icon} ${styles[colorClass]}`} strokeWidth={1.5} />
                        <span className={`${styles.value} ${styles[colorClass]}`}>
                            {isLoading ? '—' : (stats?.[key] ?? 0)}
                        </span>
                        <span className={styles.label}>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
