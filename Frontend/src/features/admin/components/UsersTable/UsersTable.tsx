import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../../shared/components/ui/table';
import type { AdminUser, GetUsersParams, PaginationMeta } from '../../types/admin.types';
import styles from './UsersTable.module.scss';

function StatutBadge({ isActif }: { isActif: boolean }) {
    return (
        <span className={isActif ? styles.badgeActif : styles.badgeInactif}>
            {isActif ? 'Actif' : 'Inactif'}
        </span>
    );
}

function RoleLabel({ role }: { role: AdminUser['role'] }) {
    const labels: Record<AdminUser['role'], string> = {
        client: 'Client',
        technicien: 'Technicien',
        admin: 'Admin',
    };
    return <span>{labels[role]}</span>;
}

interface UsersTableProps {
    // Données
    users: AdminUser[];
    meta: PaginationMeta;
    isLoading: boolean;
    error: string | null;
    filters: GetUsersParams;
    // Filtres
    onSearch: (value: string) => void;
    onRoleFilter: (role: GetUsersParams['role']) => void;
    onStatutFilter: (is_actif: GetUsersParams['is_actif']) => void;
    onPageChange: (page: number) => void;
    // Actions
    onAdd: () => void;
    onEdit: (user: AdminUser) => void;
    onDelete: (user: AdminUser) => void;
}

export function UsersTable({
    users,
    meta,
    isLoading,
    error,
    filters,
    onSearch,
    onRoleFilter,
    onStatutFilter,
    onPageChange,
    onAdd,
    onEdit,
    onDelete,
}: UsersTableProps) {
    return (
        <div className={styles.wrapper}>
            {/* En-tête */}
            <div className={styles.header}>
                <h2 className={styles.title}>Utilisateurs</h2>
                <button className={styles.addButton} onClick={onAdd}>
                    + Ajouter un utilisateur
                </button>
            </div>

            {/* Filtres */}
            <div className={styles.filters}>
                <input
                    type="search"
                    placeholder="Rechercher par nom, email..."
                    className={styles.searchInput}
                    onChange={(e) => onSearch(e.target.value)}
                />
                <select
                    className={styles.select}
                    onChange={(e) =>
                        onRoleFilter(
                            e.target.value === ''
                                ? undefined
                                : (e.target.value as AdminUser['role']),
                        )
                    }
                >
                    <option value="">Rôle</option>
                    <option value="client">Client</option>
                    <option value="technicien">Technicien</option>
                    <option value="admin">Admin</option>
                </select>
                <select
                    className={styles.select}
                    onChange={(e) =>
                        onStatutFilter(
                            e.target.value === '' ? undefined : e.target.value === 'true',
                        )
                    }
                >
                    <option value="">Statut</option>
                    <option value="true">Actif</option>
                    <option value="false">Inactif</option>
                </select>
            </div>

            {/* Table */}
            {error && <p className={styles.error}>{error}</p>}
            {isLoading ? (
                <p className={styles.loading}>Chargement...</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    {user.prenom} {user.nom}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <RoleLabel role={user.role} />
                                </TableCell>
                                <TableCell>
                                    <StatutBadge isActif={user.is_actif} />
                                </TableCell>
                                <TableCell className={styles.actions}>
                                    <button
                                        className={styles.editButton}
                                        onClick={() => onEdit(user)}
                                        aria-label={`Modifier ${user.prenom} ${user.nom}`}
                                    >
                                        ✏️ Modifier
                                    </button>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={() => onDelete(user)}
                                        aria-label={`Supprimer ${user.prenom} ${user.nom}`}
                                    >
                                        🗑️ Supprimer
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Pagination */}
            <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                    {meta.total} résultat{meta.total > 1 ? 's' : ''}
                </span>
                <div className={styles.paginationControls}>
                    <button
                        className={styles.pageBtn}
                        onClick={() => onPageChange(filters.page! - 1)}
                        disabled={filters.page === 1}
                        aria-label="Page précédente"
                    >
                        ←
                    </button>
                    {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            className={`${styles.pageBtn} ${filters.page === p ? styles.pageBtnActive : ''}`}
                            onClick={() => onPageChange(p)}
                            aria-current={filters.page === p ? 'page' : undefined}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        className={styles.pageBtn}
                        onClick={() => onPageChange(filters.page! + 1)}
                        disabled={filters.page === meta.totalPages}
                        aria-label="Page suivante"
                    >
                        →
                    </button>
                </div>
            </div>
        </div>
    );
}
