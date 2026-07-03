import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../../../shared/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '../../../../../shared/components/ui/pagination';
import type { PaginationMeta } from '../../../../../shared/types/pagination.types';
import type { AdminInterventionListItem } from '../../../types/adminIntervention.types';
import type { AdminUser } from '../../../types/admin.types';
import type { Zone } from '../../../types/zones.types';
import { getDisplayStatut, getStatutLabel } from '../../../utils/interventionStatut';
import { AdminInterventionsFilterBar } from '../AdminInterventionsFilterBar/AdminInterventionsFilterBar';
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
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
}

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
    meta,
    onPageChange,
}: AdminInterventionsListProps) {
    return (
        <div className={styles.wrapper}>
            <AdminInterventionsFilterBar
                zones={zones}
                techniciens={techniciens}
                zoneId={zoneId}
                technicienId={technicienId}
                onZoneFilter={onZoneFilter}
                onTechnicienFilter={onTechnicienFilter}
            />

            {/* États */}
            {isLoading && <p className={styles.message}>Chargement…</p>}
            {error && <p className={styles.error}>{error}</p>}

            {/* Liste */}
            {!isLoading && !error && interventions.length === 0 && (
                <p className={styles.message}>Aucune intervention à afficher.</p>
            )}

            {!isLoading && !error && interventions.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date &amp; heure</TableHead>
                            <TableHead>Zone</TableHead>
                            <TableHead>Technicien</TableHead>
                            <TableHead>Forfait</TableHead>
                            <TableHead>Statut</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {interventions.map((intervention) => {
                            const displayStatut = getDisplayStatut(intervention);
                            return (
                                <TableRow
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
                                    <TableCell>{formatDateTime(intervention.dateDebut)}</TableCell>
                                    <TableCell>{intervention.zone.nom}</TableCell>
                                    <TableCell>
                                        {intervention.technicien
                                            ? `${intervention.technicien.prenom} ${intervention.technicien.nom}`
                                            : <span className={styles.unassigned}>Non assigné</span>}
                                    </TableCell>
                                    <TableCell>{intervention.forfaitNom}</TableCell>
                                    <TableCell>
                                        <span className={`${styles.badge} ${styles[`badge${displayStatut}`]}`}>
                                            {getStatutLabel(displayStatut)}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}

            {!isLoading && !error && meta.totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (meta.page > 1) onPageChange(meta.page - 1);
                                }}
                                aria-disabled={meta.page === 1}
                                className={meta.page === 1 ? 'pointer-events-none opacity-40' : undefined}
                            />
                        </PaginationItem>
                        {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                            <PaginationItem key={p}>
                                <PaginationLink
                                    href="#"
                                    isActive={meta.page === p}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onPageChange(p);
                                    }}
                                >
                                    {p}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (meta.page < meta.totalPages) onPageChange(meta.page + 1);
                                }}
                                aria-disabled={meta.page === meta.totalPages}
                                className={
                                    meta.page === meta.totalPages ? 'pointer-events-none opacity-40' : undefined
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}