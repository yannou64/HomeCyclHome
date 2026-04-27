import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import type { Marque, TypeCycle } from '../../../types/cycles.types';
import styles from './CycleItemDeleteDialog.module.scss';

interface CycleItemDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  item: Marque | TypeCycle | null;
  entityLabel: string;
}

export function CycleItemDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  item,
  entityLabel,
}: CycleItemDeleteDialogProps) {
  if (!item) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle className={styles.title}>Supprimer {entityLabel}</DialogTitle>
        </DialogHeader>
        <p className={styles.message}>
          Êtes-vous sûr de vouloir supprimer <strong>« {item.libelle} »</strong> ?
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
