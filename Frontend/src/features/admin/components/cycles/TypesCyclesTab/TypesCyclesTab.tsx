import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../shared/components/ui/table';
import { useAdminTypeCycles } from '../../../hooks/useAdminTypeCycles';
import type { TypeCycle } from '../../../types/cycles.types';
import { CycleItemDeleteDialog } from '../CycleItemDeleteDialog/CycleItemDeleteDialog';
import { CycleItemFormDialog } from '../CycleItemFormDialog/CycleItemFormDialog';
import styles from './TypesCyclesTab.module.scss';

export function TypesCyclesTab() {
  const { items, isLoading, error, createItem, updateItem, deleteItem } = useAdminTypeCycles();
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
          + Ajouter un type de cycle
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
              items.map((item) => (
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
