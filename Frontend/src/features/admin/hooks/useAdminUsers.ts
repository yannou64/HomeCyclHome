import { useCallback, useState } from 'react';
import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminUsersService } from '../services/adminUsersService';
import type {
    CreateUserPayload,
    GetUsersParams,
    PaginatedUsers,
    UpdateUserPayload,
} from '../types/admin.types';

// Page vide affichée avant la première réponse.
const EMPTY_PAGE: PaginatedUsers = {
    data: [],
    meta: { total: 0, page: 1, limit: 6, totalPages: 1 },
};

export function useAdminUsers() {
    const [filters, setFilters] = useState<GetUsersParams>({
        page: 1,
        limit: 6,
    });

    // Le loader dépend des filtres : useCallback ne le recrée que lorsqu'ils
    // changent, ce qui déclenche un rechargement (et isLoading passe à true).
    const loadUsers = useCallback(
        () => adminUsersService.getUsers(filters),
        [filters],
    );
    const { data, isLoading, error, reload } = useAsyncData(
        loadUsers,
        EMPTY_PAGE,
        'Impossible de charger les utilisateurs.',
    );
    const { data: users, meta } = data;

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
        reload();
    };

    const updateUser = async (id: string, payload: UpdateUserPayload) => {
        await adminUsersService.updateUser(id, payload);
        reload();
    };

    const deleteUser = async (id: string) => {
        await adminUsersService.deleteUser(id);
        reload();
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
