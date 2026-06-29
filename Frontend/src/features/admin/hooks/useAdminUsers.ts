import { useCallback, useEffect, useState } from 'react';
import { adminUsersService } from '../services/adminUsersService';
import type {
    AdminUser,
    CreateUserPayload,
    GetUsersParams,
    PaginationMeta,
    UpdateUserPayload,
} from '../types/admin.types';

export function useAdminUsers() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<GetUsersParams>({
        page: 1,
        limit: 10,
    });

    const fetchUsers = useCallback(async (params: GetUsersParams) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await adminUsersService.getUsers(params);
            setUsers(result.data);
            setMeta(result.meta);
        } catch {
            setError('Impossible de charger les utilisateurs.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Recharge automatiquement quand les filtres changent
    useEffect(() => {
        void fetchUsers(filters);
    }, [filters, fetchUsers]);

    const setPage = (page: number) =>
        setFilters((prev) => ({ ...prev, page }));

    const setSearch = (search: string) =>
        setFilters((prev) => ({ ...prev, search, page: 1 }));

    const setRoleFilter = (role: GetUsersParams['role']) =>
        setFilters((prev) => ({ ...prev, role, page: 1 }));

    const setStatutFilter = (isActif: GetUsersParams['isActif']) =>
        setFilters((prev) => ({ ...prev, isActif, page: 1 }));

    const createUser = async (payload: CreateUserPayload) => {
        await adminUsersService.createUser(payload);
        await fetchUsers(filters);
    };

    const updateUser = async (id: string, payload: UpdateUserPayload) => {
        await adminUsersService.updateUser(id, payload);
        await fetchUsers(filters);
    };

    const deleteUser = async (id: string) => {
        await adminUsersService.deleteUser(id);
        await fetchUsers(filters);
    };

    return {
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
    };
}
