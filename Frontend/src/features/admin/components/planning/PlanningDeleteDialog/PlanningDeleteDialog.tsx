import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import styles from './PlanningDeleteDialog.module.scss';

interface PlanningDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
}

export function PlanningDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
}: PlanningDeleteDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle className={styles.title}>{title}</DialogTitle>
        </DialogHeader>
        <p className={styles.message}>{description}</p>
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