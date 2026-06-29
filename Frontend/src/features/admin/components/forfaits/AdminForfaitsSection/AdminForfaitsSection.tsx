import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../shared/components/ui/table';
import { useAdminForfaits } from '../../../hooks/useAdminForfaits';
import type { Forfait } from '../../../types/forfaits.types';
import { ForfaitDeleteDialog } from '../ForfaitDeleteDialog/ForfaitDeleteDialog';
import { ForfaitFormDialog } from '../ForfaitFormDialog/ForfaitFormDialog';
import { ForfaitPrixDialog } from '../ForfaitPrixDialog/ForfaitPrixDialog';
import styles from './AdminForfaitsSection.module.scss';

export function AdminForfaitsSection() {
  const { items, isLoading, error, createItem, updateItem, deleteItem, setPrix } = useAdminForfaits();
  const [editingItem, setEditingItem] = useState<Forfait | null>(null);
  const [deletingItem, setDeletingItem] = useState<Forfait | null>(null);
  const [prixItem, setPrixItem] = useState<Forfait | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Forfait) => {
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
        <h2 className={styles.title}>Forfaits</h2>
        <button className={styles.addButton} onClick={handleAdd}>
          + Nouveau forfait
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isLoading ? (
        <p className={styles.loading}>Chargement...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Prix actuel</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className={styles.actionsHead}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className={styles.empty}>
                  Aucun forfait enregistré.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className={styles.nomCell}>{item.nom}</TableCell>
                  <TableCell className={styles.descriptionCell}>
                    {item.description ?? <span className={styles.none}>—</span>}
                  </TableCell>
                  <TableCell>{item.dureeMinutes} min</TableCell>
                  <TableCell>
                    {item.prixActif !== null
                      ? `${item.prixActif} €`
                      : <span className={styles.none}>—</span>}
                  </TableCell>
                  <TableCell>
                    <span className={item.isActif ? styles.badgeActif : styles.badgeInactif}>
                      {item.isActif ? 'Actif' : 'Inactif'}
                    </span>
                  </TableCell>
                  <TableCell className={styles.actions}>
                    <button
                      className={styles.prixButton}
                      onClick={() => setPrixItem(item)}
                      aria-label={`Définir le prix de ${item.nom}`}
                    >
                      💰 Prix
                    </button>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(item)}
                      aria-label={`Modifier ${item.nom}`}
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => setDeletingItem(item)}
                      aria-label={`Supprimer ${item.nom}`}
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
        <div className={styles.paginationControls}>
          <button className={styles.pageBtn} disabled aria-label="Page précédente">←</button>
          <button className={`${styles.pageBtn} ${styles.pageBtnActive}`} aria-current="page">1</button>
          <button className={styles.pageBtn} disabled aria-label="Page suivante">→</button>
        </div>
      </div>

      <ForfaitFormDialog
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={editingItem ? (p) => updateItem(editingItem.id, p) : createItem}
        item={editingItem ?? undefined}
      />

      <ForfaitDeleteDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => deleteItem(deletingItem!.id)}
        item={deletingItem}
      />

      <ForfaitPrixDialog
        isOpen={!!prixItem}
        onClose={() => setPrixItem(null)}
        onSubmit={(payload) => setPrix(prixItem!.id, payload)}
        item={prixItem}
      />
    </div>
  );
}