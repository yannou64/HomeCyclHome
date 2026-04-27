import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../shared/components/ui/table';
import { useAdminMarques } from '../../hooks/useAdminMarques';
import type { Marque } from '../../types/cycles.types';
import { CycleItemDeleteDialog } from '../CycleItemDeleteDialog/CycleItemDeleteDialog';
import { CycleItemFormDialog } from '../CycleItemFormDialog/CycleItemFormDialog';
import styles from './MarquesTab.module.scss';

export function MarquesTab() {
  const { items, isLoading, error, createItem, updateItem, deleteItem } = useAdminMarques();
  const [editingItem, setEditingItem] = useState<Marque | null>(null);
  const [deletingItem, setDeletingItem] = useState<Marque | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Marque) => {
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
          + Ajouter une marque
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
                  Aucune marque enregistrée.
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
        entityLabel="une marque"
      />

      <CycleItemDeleteDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => deleteItem(deletingItem!.id)}
        item={deletingItem}
        entityLabel="la marque"
      />
    </div>
  );
}
