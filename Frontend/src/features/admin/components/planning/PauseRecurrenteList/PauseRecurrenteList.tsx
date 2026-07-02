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
  const { pageItems, page, setPage, totalPages } = usePagination(pauses, 6);
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
              pageItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.jourSemaine !== null
                      ? JOURS[item.jourSemaine]
                      : <span className={styles.allDays}>Tous les jours</span>}
                  </TableCell>
                  <TableCell>
                    {minutesToTime(item.heureDebut)} – {minutesToTime(item.heureFin)}
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