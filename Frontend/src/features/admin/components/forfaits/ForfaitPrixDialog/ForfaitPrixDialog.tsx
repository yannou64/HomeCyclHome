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
  onSubmit: (payload: { montant: number; date_debut: string }) => Promise<void>;
  item: Forfait | null;
}

const today = () => new Date().toISOString().split('T')[0];

export function ForfaitPrixDialog({
  isOpen,
  onClose,
  onSubmit,
  item,
}: ForfaitPrixDialogProps) {
  const [form, setForm] = useState({ montant: '', date_debut: today() });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({ montant: item?.prix_actif != null ? String(item.prix_actif) : '', date_debut: today() });
    setError(null);
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ montant: Number(form.montant), date_debut: form.date_debut });
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

        {item?.prix_actif !== null && item?.prix_actif !== undefined && (
          <p className={styles.currentPrice}>
            Prix actuel : <strong>{item.prix_actif} €</strong>
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
            <label className={styles.label} htmlFor="date_debut">
              Date d'application
            </label>
            <input
              id="date_debut"
              type="date"
              className={styles.input}
              value={form.date_debut}
              onChange={(e) => setForm((f) => ({ ...f, date_debut: e.target.value }))}
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