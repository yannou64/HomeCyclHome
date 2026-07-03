import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import type { Forfait, ForfaitPayload } from '../../../types/forfaits.types';
import styles from './ForfaitFormDialog.module.scss';

interface ForfaitFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ForfaitPayload) => Promise<void>;
  item?: Forfait;
}

const DEFAULT_FORM = { nom: '', description: '', dureeMinutes: 60, isActif: true };

export function ForfaitFormDialog({
  isOpen,
  onClose,
  onSubmit,
  item,
}: ForfaitFormDialogProps) {
  const isEditing = !!item;
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setForm({
        nom: item.nom,
        description: item.description ?? '',
        dureeMinutes: item.dureeMinutes,
        isActif: item.isActif,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setError(null);
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        nom: form.nom,
        description: form.description || undefined,
        dureeMinutes: form.dureeMinutes,
        isActif: form.isActif,
      });
      onClose();
    } catch {
      setError('Ce nom existe déjà ou une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle className={styles.title}>
            {isEditing ? 'Modifier le forfait' : 'Nouveau forfait'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nom">
              Nom
            </label>
            <input
              id="nom"
              type="text"
              className={styles.input}
              value={form.nom}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="description">
              Description <span className={styles.optional}>(optionnel)</span>
            </label>
            <textarea
              id="description"
              className={styles.textarea}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="dureeMinutes">
              Durée (minutes)
            </label>
            <input
              id="dureeMinutes"
              type="number"
              className={styles.input}
              value={form.dureeMinutes}
              onChange={(e) => setForm((f) => ({ ...f, dureeMinutes: Number(e.target.value) }))}
              min={15}
              required
            />
          </div>

          <div className={styles.checkboxField}>
            <input
              id="isActif"
              type="checkbox"
              className={styles.checkbox}
              checked={form.isActif}
              onChange={(e) => setForm((f) => ({ ...f, isActif: e.target.checked }))}
            />
            <label className={styles.checkboxLabel} htmlFor="isActif">
              Forfait actif
            </label>
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
              {isSubmitting ? 'En cours...' : isEditing ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}