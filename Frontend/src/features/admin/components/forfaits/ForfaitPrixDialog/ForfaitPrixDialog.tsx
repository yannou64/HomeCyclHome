import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import type { Forfait } from '../../../types/forfaits.types';
import styles from './ForfaitPrixDialog.module.scss';

interface ForfaitPrixDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { montant: number; dateDebut: string }) => Promise<void>;
  item: Forfait | null;
}

const today = () => new Date().toISOString().split('T')[0];

export function ForfaitPrixDialog({
  isOpen,
  onClose,
  onSubmit,
  item,
}: ForfaitPrixDialogProps) {
  const [form, setForm] = useState({ montant: '', dateDebut: today() });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({ montant: item?.prixActif != null ? String(item.prixActif) : '', dateDebut: today() });
    setError(null);
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ montant: Number(form.montant), dateDebut: form.dateDebut });
      onClose();
    } catch {
      setError('Une erreur est survenue lors de la mise à jour du prix.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle className={styles.title}>
            Définir un prix — {item?.nom}
          </DialogTitle>
        </DialogHeader>

        {item?.prixActif !== null && item?.prixActif !== undefined && (
          <p className={styles.currentPrice}>
            Prix actuel : <strong>{item.prixActif} €</strong>
          </p>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="montant">
              Nouveau montant (€)
            </label>
            <input
              id="montant"
              type="number"
              className={styles.input}
              value={form.montant}
              onChange={(e) => setForm((f) => ({ ...f, montant: e.target.value }))}
              min={0}
              step={0.01}
              required
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="dateDebut">
              Date d'application
            </label>
            <input
              id="dateDebut"
              type="date"
              className={styles.input}
              value={form.dateDebut}
              onChange={(e) => setForm((f) => ({ ...f, dateDebut: e.target.value }))}
              required
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
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'En cours...' : 'Valider'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}