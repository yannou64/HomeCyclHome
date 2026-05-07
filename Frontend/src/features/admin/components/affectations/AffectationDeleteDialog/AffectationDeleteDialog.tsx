import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import type { Affectation } from '../../../types/affectations.types';
import styles from './AffectationDeleteDialog.module.scss';

interface AffectationDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  item: Affectation | null;
}

export function AffectationDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  item,
}: AffectationDeleteDialogProps) {
  if (!item) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle className={styles.title}>Supprimer l'affectation</DialogTitle>
        </DialogHeader>
        <p className={styles.message}>
          Êtes-vous sûr de vouloir supprimer les affectations de{' '}
          <strong>« {item.prenom} {item.nom} »</strong> ?
          <br />
          Cette action est irréversible.
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Annuler
          </button>
          <button className={styles.confirmButton} onClick={handleConfirm}>
            Supprimer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}