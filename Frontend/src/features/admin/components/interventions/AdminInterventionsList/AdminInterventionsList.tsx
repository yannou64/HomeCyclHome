import type { AdminInterventionListItem, AdminInterventionStatut } from '../../../types/adminIntervention.types';
import type { AdminUser } from '../../../types/admin.types';
import type { Zone } from '../../../types/zones.types';
import styles from './AdminInterventionsList.module.scss';

interface AdminInterventionsListProps {
    interventions: AdminInterventionListItem[];
    isLoading: boolean;
    error: string | null;
    zones: Zone[];
    techniciens: AdminUser[];
    zoneId?: string;
    technicienId?: string;
    onZoneFilter: (zoneId: string | undefined) => void;
    onTechnicienFilter: (technicienId: string | undefined) => void;
    onRowClick: (id: string) => void;
}

const STATUT_LABELS: Record<AdminInterventionStatut, string> = {
    Planifiee: 'Planifiée',
    Terminee: 'Terminée',
    Annulee: 'Annulée',
};

function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    const jour = date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    const heure = date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    });
    return `${jour} — ${heure}`;
}

export function AdminInterventionsList({
    interventions,
    isLoading,
    error,
    zones,
    techniciens,
    zoneId,
    technicienId,
    onZoneFilter,
    onTechnicienFilter,
    onRowClick,
}: AdminInterventionsListProps) {
    return (
        <div className={styles.wrapper}>
            {/* Filtres */}
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

            {/* États */}
            {isLoading && <p className={styles.message}>Chargement…</p>}
            {error && <p className={styles.error}>{error}</p>}

            {/* Liste */}
            {!isLoading && !error && interventions.length === 0 && (
                <p className={styles.message}>Aucune intervention à afficher.</p>
            )}

            {!isLoading && !error && interventions.length > 0 && (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date &amp; heure</th>
                                <th>Zone</th>
                                <th>Technicien</th>
                                <th>Forfait</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {interventions.map((intervention) => (
                                <tr
                                    key={intervention.id}
                                    className={styles.row}
                                    onClick={() => onRowClick(intervention.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            onRowClick(intervention.id);
                                        }
                                    }}
                                >
                                    <td>{formatDateTime(intervention.dateDebut)}</td>
                                    <td>{intervention.zone.nom}</td>
                                    <td>
                                        {intervention.technicien
                                            ? `${intervention.technicien.prenom} ${intervention.technicien.nom}`
                                            : <span className={styles.unassigned}>Non assigné</span>}
                                    </td>
                                    <td>{intervention.forfaitNom}</td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[`badge${intervention.statut}`]}`}>
                                            {STATUT_LABELS[intervention.statut]}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
