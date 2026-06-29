import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../shared/components/ui/table';
import { useAdminAffectations } from '../../../hooks/useAdminAffectations';
import type { Affectation } from '../../../types/affectations.types';
import { AffectationDeleteDialog } from '../AffectationDeleteDialog/AffectationDeleteDialog';
import { AffectationFormDialog } from '../AffectationFormDialog/AffectationFormDialog';
import styles from './AdminAffectationsSection.module.scss';

export function AdminAffectationsSection() {
  const { items, isLoading, error, setZones, deleteAffectation } = useAdminAffectations();
  const [editingItem, setEditingItem] = useState<Affectation | null>(null);
  const [deletingItem, setDeletingItem] = useState<Affectation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Affectation) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleFormSubmit = async (technicienId: string, zoneIds: string[]) => {
    await setZones(technicienId, { zoneIds: zoneIds });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Affectations des techniciens</h2>
        <button className={styles.addButton} onClick={handleAdd}>
          + Nouvelle affectation
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isLoading ? (
        <p className={styles.loading}>Chargement...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Technicien</TableHead>
              <TableHead>Zones affectées</TableHead>
              <TableHead className={styles.actionsHead}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className={styles.empty}>
                  Aucune affectation enregistrée.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.technicienId}>
                  <TableCell className={styles.technicienCell}>
                    {item.prenom} {item.nom}
                  </TableCell>
                  <TableCell>
                    <div className={styles.zonesBadges}>
                      {item.zones.length === 0 ? (
                        <span className={styles.none}>Aucune zone</span>
                      ) : (
                        item.zones.map((zone) => (
                          <span
                            key={zone.id}
                            className={zone.isActive ? styles.badgeZone : styles.badgeZoneInactive}
                          >
                            {zone.nomZone}
                          </span>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={styles.actions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(item)}
                      aria-label={`Modifier les zones de ${item.prenom} ${item.nom}`}
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => setDeletingItem(item)}
                      aria-label={`Supprimer l'affectation de ${item.prenom} ${item.nom}`}
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
          {items.length} technicien{items.length > 1 ? 's' : ''} affecté{items.length > 1 ? 's' : ''}
        </span>
      </div>

      <AffectationFormDialog
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        item={editingItem ?? undefined}
      />

      <AffectationDeleteDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => deleteAffectation(deletingItem!.technicienId)}
        item={deletingItem}
      />
    </div>
  );
}