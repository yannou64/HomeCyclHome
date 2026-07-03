import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import type { Zone } from '../../../types/zones.types';
import styles from './ZoneDeleteDialog.module.scss';

interface ZoneDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  zone: Zone | null;
}

export function ZoneDeleteDialog({ isOpen, onClose, onConfirm, zone }: ZoneDeleteDialogProps) {
  if (!zone) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle className={styles.title}>Supprimer la zone</DialogTitle>
        </DialogHeader>
        <p className={styles.message}>
          Êtes-vous sûr de vouloir supprimer la zone <strong>« {zone.nomZone} »</strong> ?
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