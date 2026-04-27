import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../shared/components/ui/dialog';
import type { CycleItemPayload, Marque, TypeCycle } from '../../types/cycles.types';
import styles from './CycleItemFormDialog.module.scss';

interface CycleItemFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CycleItemPayload) => Promise<void>;
  item?: Marque | TypeCycle;
  entityLabel: string;
}

export function CycleItemFormDialog({
  isOpen,
  onClose,
  onSubmit,
  item,
  entityLabel,
}: CycleItemFormDialogProps) {
  const isEditing = !!item;
  const [libelle, setLibelle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLibelle(item?.libelle ?? '');
    setError(null);
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ libelle });
      onClose();
    } catch {
      setError('Ce libellé existe déjà ou une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle className={styles.title}>
            {isEditing ? `Modifier ${entityLabel}` : `Ajouter ${entityLabel}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="libelle">
              Libellé
            </label>
            <input
              id="libelle"
              type="text"
              className={styles.input}
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              required
              minLength={2}
              autoFocus
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'En cours...' : isEditing ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
