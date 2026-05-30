import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import type { GenerationRapport } from '../../../types/planning.types';
import styles from './GenerationRapportDialog.module.scss';

interface GenerationRapportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rapport: GenerationRapport | null;
}

export function GenerationRapportDialog({ isOpen, onClose, rapport }: GenerationRapportDialogProps) {
  if (!rapport) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle className={styles.title}>Génération terminée</DialogTitle>
        </DialogHeader>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{rapport.created}</span>
            <span className={styles.statLabel}>créneau{rapport.created > 1 ? 'x' : ''} créé{rapport.created > 1 ? 's' : ''}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{rapport.skipped}</span>
            <span className={styles.statLabel}>ignoré{rapport.skipped > 1 ? 's' : ''}</span>
          </div>
          {rapport.conflicts > 0 && (
            <div className={`${styles.stat} ${styles.statConflict}`}>
              <span className={styles.statValue}>{rapport.conflicts}</span>
              <span className={styles.statLabel}>conflit{rapport.conflicts > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {rapport.conflicts > 0 && (
          <p className={styles.conflictWarning}>
            {rapport.conflicts} créneau{rapport.conflicts > 1 ? 'x' : ''} déjà réservé{rapport.conflicts > 1 ? 's' : ''} dans cette période — à traiter manuellement.
          </p>
        )}

        <div className={styles.actions}>
          <button className={styles.closeButton} onClick={onClose}>
            Fermer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}