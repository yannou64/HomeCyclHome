import { useState } from 'react';
import { AdminSidebar, type AdminSection } from '../AdminSidebar/AdminSidebar';
import { UsersTable } from '../UsersTable/UsersTable';
import { UserFormDialog } from '../UserFormDialog/UserFormDialog';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog/DeleteConfirmDialog';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import type { AdminUser, CreateUserPayload, UpdateUserPayload } from '../../types/admin.types';
import styles from './AdminLayout.module.scss';

// Tailwind chargé uniquement dans le contexte admin
import '../../../../app/styles/tailwind.css';

export function AdminLayout() {
    const [activeSection, setActiveSection] = useState<AdminSection>('utilisateurs');
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Source de vérité unique — partagée entre la table et les dialogs
    const {
        users,
        meta,
        isLoading,
        error,
        filters,
        setPage,
        setSearch,
        setRoleFilter,
        setStatutFilter,
        createUser,
        updateUser,
        deleteUser,
    } = useAdminUsers();

    const handleEdit = (user: AdminUser) => {
        setEditingUser(user);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setEditingUser(null);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingUser(null);
    };

    const handleFormSubmit = async (data: CreateUserPayload | UpdateUserPayload) => {
        if (editingUser) {
            await updateUser(editingUser.id, data as UpdateUserPayload);
        } else {
            await createUser(data as CreateUserPayload);
        }
    };

    const handleDeleteConfirm = async () => {
        if (deletingUser) await deleteUser(deletingUser.id);
    };

    return (
        <div className={styles.layout}>
            <AdminSidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
            />
            <main className={styles.content}>
                {activeSection === 'utilisateurs' ? (
                    <UsersTable
                        users={users}
                        meta={meta}
                        isLoading={isLoading}
                        error={error}
                        filters={filters}
                        onSearch={setSearch}
                        onRoleFilter={setRoleFilter}
                        onStatutFilter={setStatutFilter}
                        onPageChange={setPage}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={setDeletingUser}
                    />
                ) : (
                    <p className={styles.placeholder}>
                        Section « {activeSection} » — à venir
                    </p>
                )}
            </main>

            <UserFormDialog
                isOpen={isFormOpen}
                onClose={handleFormClose}
                onSubmit={handleFormSubmit}
                user={editingUser ?? undefined}
            />

            <DeleteConfirmDialog
                isOpen={!!deletingUser}
                onClose={() => setDeletingUser(null)}
                onConfirm={handleDeleteConfirm}
                user={deletingUser}
            />
        </div>
    );
}
