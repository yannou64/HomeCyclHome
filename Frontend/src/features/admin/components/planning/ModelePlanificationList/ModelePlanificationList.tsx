import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../shared/components/ui/table';
import { minutesToTime } from '../../../../../shared/utils/timeUtils';
import type {
  CreateModelePlanificationPayload,
  ModelePlanification,
  UpdateModelePlanificationPayload,
} from '../../../types/planning.types';
import { ModelePlanificationFormDialog } from '../ModelePlanificationFormDialog/ModelePlanificationFormDialog';
import { PlanningDeleteDialog } from '../PlanningDeleteDialog/PlanningDeleteDialog';
import styles from './ModelePlanificationList.module.scss';

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

interface ModelePlanificationListProps {
  modeles: ModelePlanification[];
  technicienId: string;
  isLoading: boolean;
  error: string | null;
  onCreate: (payload: CreateModelePlanificationPayload) => Promise<void>;
  onUpdate: (id: string, payload: UpdateModelePlanificationPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function ModelePlanificationList({
  modeles,
  technicienId,
  isLoading,
  error,
  onCreate,
  onUpdate,
  onDelete,
}: ModelePlanificationListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ModelePlanification | null>(null);
  const [deletingItem, setDeletingItem] = useState<ModelePlanification | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: ModelePlanification) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleFormSubmit = async (
    payload: CreateModelePlanificationPayload | UpdateModelePlanificationPayload,
  ) => {
    if (editingItem) {
      await onUpdate(editingItem.id, payload as UpdateModelePlanificationPayload);
    } else {
      await onCreate(payload as CreateModelePlanificationPayload);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button className={styles.addButton} onClick={handleAdd}>
          + Nouveau modèle
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isLoading ? (
        <p className={styles.loading}>Chargement...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jour</TableHead>
              <TableHead>Horaires</TableHead>
              <TableHead>Intervalle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Validité</TableHead>
              <TableHead className={styles.actionsHead}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modeles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className={styles.empty}>
                  Aucun modèle de planification enregistré.
                </TableCell>
              </TableRow>
            ) : (
              modeles.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className={styles.jour}>
                    {JOURS[item.jour_semaine]}
                  </TableCell>
                  <TableCell>
                    {minutesToTime(item.heure_debut)} – {minutesToTime(item.heure_fin)}
                  </TableCell>
                  <TableCell>{item.intervalle_minutes} min</TableCell>
                  <TableCell>
                    <span className={item.is_actif ? styles.badgeActif : styles.badgeInactif}>
                      {item.is_actif ? 'Actif' : 'Inactif'}
                    </span>
                  </TableCell>
                  <TableCell className={styles.validite}>
                    {formatDate(item.date_debut_validite)}
                    {item.date_fin_validite
                      ? ` → ${formatDate(item.date_fin_validite)}`
                      : ' → ∞'}
                  </TableCell>
                  <TableCell className={styles.actions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(item)}
                      aria-label="Modifier ce modèle"
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => setDeletingItem(item)}
                      aria-label="Supprimer ce modèle"
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

      <div className={styles.footer}>
        <span className={styles.count}>
          {modeles.length} modèle{modeles.length > 1 ? 's' : ''}
        </span>
      </div>

      <ModelePlanificationFormDialog
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        technicienId={technicienId}
        item={editingItem ?? undefined}
      />

      <PlanningDeleteDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => onDelete(deletingItem!.id)}
        title="Supprimer le modèle"
        description="Êtes-vous sûr de vouloir supprimer ce modèle de planification ? Cette action est irréversible."
      />
    </div>
  );
}
