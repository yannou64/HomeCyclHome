import { useMemo, useState } from 'react';

export function usePagination<T>(items: T[], pageSize: number) {
    const [page, setPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    // Clamp : si la liste rétrécit (suppression) et que la page courante n'existe
    // plus, on retombe sur la dernière page valide au lieu d'afficher une page vide.
    const safePage = Math.min(page, totalPages);

    const pageItems = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [items, safePage, pageSize]);

    return { pageItems, page: safePage, setPage, totalPages };
}