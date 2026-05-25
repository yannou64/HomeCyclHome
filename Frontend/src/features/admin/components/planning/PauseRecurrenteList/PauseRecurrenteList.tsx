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
import type { CreatePauseRecurrentePayload, PauseRecurrente } from '../../../types/planning.types';
import { PauseRecurrenteFormDialog } from '../PauseRecurrenteFormDialog/PauseRecurrenteFormDialog';
import { PlanningDeleteDialog } from '../PlanningDeleteDialog/PlanningDeleteDialog';
import styles from './PauseRecurrenteList.module.scss';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

interface PauseRecurrenteListProps {
  pauses: PauseRecurrente[];
  technicienId: string;
  isLoading: boolean;
  error: string | null;
  onCreate: (payload: CreatePauseRecurrentePayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function PauseRecurrenteList({
  pauses,
  technicienId,
  isLoading,
  error,
  onCreate,
  onDelete,
}: PauseRecurrenteListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<PauseRecurrente | null>(null);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button className={styles.addButton} onClick={() => setIsFormOpen(true)}>
          + Nouvelle pause
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
              <TableHead>Description</TableHead>
              <TableHead className={styles.actionsHead}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pauses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className={styles.empty}>
                  Aucune pause récurrente enregistrée.
                </TableCell>
              </TableRow>
            ) : (
              pauses.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.jour_semaine !== null
                      ? JOURS[item.jour_semaine]
                      : <span className={styles.allDays}>Tous les jours</span>}
                  </TableCell>
                  <TableCell>
                    {minutesToTime(item.heure_debut)} – {minutesToTime(item.heure_fin)}
                  </TableCell>
                  <TableCell className={styles.description}>
                    {item.description ?? <span className={styles.none}>—</span>}
                  </TableCell>
                  <TableCell className={styles.actions}>
                    <button
                      className={styles.deleteButton}
                      onClick={() => setDeletingItem(item)}
                      aria-label="Supprimer cette pause"
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
          {pauses.length} pause{pauses.length > 1 ? 's' : ''}
        </span>
      </div>

      <PauseRecurrenteFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={onCreate}
        technicienId={technicienId}
      />

      <PlanningDeleteDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => onDelete(deletingItem!.id)}
        title="Supprimer la pause"
        description="Êtes-vous sûr de vouloir supprimer cette pause récurrente ? Cette action est irréversible."
      />
    </div>
  );
}