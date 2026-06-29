import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../shared/components/ui/table';
import type { CreateIndisponibilitePayload, Indisponibilite } from '../../../types/planning.types';
import { IndisponibiliteFormDialog } from '../IndisponibiliteFormDialog/IndisponibiliteFormDialog';
import { PlanningDeleteDialog } from '../PlanningDeleteDialog/PlanningDeleteDialog';
import styles from './IndisponibiliteList.module.scss';

interface IndisponibiliteListProps {
  indisponibilites: Indisponibilite[];
  technicienId: string;
  isLoading: boolean;
  error: string | null;
  onCreate: (payload: CreateIndisponibilitePayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function formatDatetime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function IndisponibiliteList({
  indisponibilites,
  technicienId,
  isLoading,
  error,
  onCreate,
  onDelete,
}: IndisponibiliteListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Indisponibilite | null>(null);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button className={styles.addButton} onClick={() => setIsFormOpen(true)}>
          + Nouvelle indisponibilité
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isLoading ? (
        <p className={styles.loading}>Chargement...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Début</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Motif</TableHead>
              <TableHead className={styles.actionsHead}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {indisponibilites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className={styles.empty}>
                  Aucune indisponibilité enregistrée.
                </TableCell>
              </TableRow>
            ) : (
              indisponibilites.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDatetime(item.dateDebut)}</TableCell>
                  <TableCell>{formatDatetime(item.dateFin)}</TableCell>
                  <TableCell className={styles.motif}>
                    {item.motif ?? <span className={styles.none}>—</span>}
                  </TableCell>
                  <TableCell className={styles.actions}>
                    <button
                      className={styles.deleteButton}
                      onClick={() => setDeletingItem(item)}
                      aria-label="Supprimer cette indisponibilité"
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
          {indisponibilites.length} indisponibilité{indisponibilites.length > 1 ? 's' : ''}
        </span>
      </div>

      <IndisponibiliteFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={onCreate}
        technicienId={technicienId}
      />

      <PlanningDeleteDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => onDelete(deletingItem!.id)}
        title="Supprimer l'indisponibilité"
        description="Êtes-vous sûr de vouloir supprimer cette indisponibilité ? Cette action est irréversible."
      />
    </div>
  );
}