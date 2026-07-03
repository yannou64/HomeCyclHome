import type { AdminUser } from '../../../types/admin.types';
import type { Zone } from '../../../types/zones.types';
import styles from './AdminInterventionsFilterBar.module.scss';

interface AdminInterventionsFilterBarProps {
    zones: Zone[];
    techniciens: AdminUser[];
    zoneId?: string;
    technicienId?: string;
    onZoneFilter: (zoneId: string | undefined) => void;
    onTechnicienFilter: (technicienId: string | undefined) => void;
}

export function AdminInterventionsFilterBar({
    zones,
    techniciens,
    zoneId,
    technicienId,
    onZoneFilter,
    onTechnicienFilter,
}: AdminInterventionsFilterBarProps) {
    return (
        <div className={styles.filters}>
            <select
                className={styles.select}
                value={zoneId ?? ''}
                onChange={(e) => onZoneFilter(e.target.value || undefined)}
                aria-label="Filtrer par zone"
            >
                <option value="">Toutes les zones</option>
                {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                        {z.nomZone}
                    </option>
                ))}
            </select>

            <select
                className={styles.select}
                value={technicienId ?? ''}
                onChange={(e) => onTechnicienFilter(e.target.value || undefined)}
                aria-label="Filtrer par technicien"
            >
                <option value="">Tous les techniciens</option>
                {techniciens.map((t) => (
                    <option key={t.id} value={t.id}>
                        {t.prenom} {t.nom}
                    </option>
                ))}
            </select>
        </div>
    );
}