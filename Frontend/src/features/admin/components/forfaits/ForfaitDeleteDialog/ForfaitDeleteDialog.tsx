import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import type { Forfait } from '../../../types/forfaits.types';
import styles from './ForfaitDeleteDialog.module.scss';

interface ForfaitDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  item: Forfait | null;
}

export function ForfaitDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  item,
}: ForfaitDeleteDialogProps) {
  if (!item) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle className={styles.title}>Supprimer le forfait</DialogTitle>
        </DialogHeader>
        <p className={styles.message}>
          Êtes-vous sûr de vouloir supprimer <strong>« {item.nom} »</strong> ?
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