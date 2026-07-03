import { useState } from 'react';
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
import { usePagination } from '../../../../../shared/hooks/usePagination';
import { useAdminTypeCycles } from '../../../hooks/useAdminTypeCycles';
import type { TypeCycle } from '../../../types/cycles.types';
import { CycleItemDeleteDialog } from '../CycleItemDeleteDialog/CycleItemDeleteDialog';
import { CycleItemFormDialog } from '../CycleItemFormDialog/CycleItemFormDialog';
import styles from './TypesCyclesTab.module.scss';

export function TypesCyclesTab() {
  const { items, isLoading, error, createItem, updateItem, deleteItem } = useAdminTypeCycles();
  const { pageItems, page, setPage, totalPages } = usePagination(items, 6);
  const [editingItem, setEditingItem] = useState<TypeCycle | null>(null);
  const [deletingItem, setDeletingItem] = useState<TypeCycle | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: TypeCycle) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button className={styles.addButton} onClick={handleAdd}>
          + Nouveau type
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isLoading ? (
        <p className={styles.loading}>Chargement...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Libellé</TableHead>
              <TableHead className={styles.actionsHead}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className={styles.empty}>
                  Aucun type de cycle enregistré.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.libelle}</TableCell>
                  <TableCell className={styles.actions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(item)}
                      aria-label={`Modifier ${item.libelle}`}
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => setDeletingItem(item)}
                      aria-label={`Supprimer ${item.libelle}`}
                    >
                      🗑️ Supprimer
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <div className={styles.pagination}>
        <span className={styles.paginationInfo}>
          {items.length} résultat{items.length > 1 ? 's' : ''}
        </span>
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                  aria-disabled={page === 1}
                  className={page === 1 ? 'pointer-events-none opacity-40' : undefined}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={page === p}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(p);
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
                    if (page < totalPages) setPage(page + 1);
                  }}
                  aria-disabled={page === totalPages}
                  className={page === totalPages ? 'pointer-events-none opacity-40' : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <CycleItemFormDialog
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={editingItem ? (p) => updateItem(editingItem.id, p) : createItem}
        item={editingItem ?? undefined}
        entityLabel="un type de cycle"
      />

      <CycleItemDeleteDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => deleteItem(deletingItem!.id)}
        item={deletingItem}
        entityLabel="le type de cycle"
      />
    </div>
  );
}
