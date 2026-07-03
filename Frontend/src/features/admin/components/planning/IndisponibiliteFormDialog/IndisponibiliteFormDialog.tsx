import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import type { CreateIndisponibilitePayload } from '../../../types/planning.types';
import styles from './IndisponibiliteFormDialog.module.scss';

interface IndisponibiliteFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateIndisponibilitePayload) => Promise<void>;
  technicienId: string;
}

export function IndisponibiliteFormDialog({
  isOpen,
  onClose,
  onSubmit,
  technicienId,
}: IndisponibiliteFormDialogProps) {
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [motif, setMotif] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Réinitialise l'état et ferme — utilisé par tous les chemins de fermeture
  const handleClose = () => {
    setDateDebut('');
    setDateFin('');
    setMotif('');
    setFormError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!dateDebut || !dateFin) {
      setFormError('Les dates de début et de fin sont obligatoires.');
      return;
    }

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (fin <= debut) {
      setFormError('La date de fin doit être postérieure à la date de début.');
      return;
    }

    setFormError(null);
    try {
      await onSubmit({
        technicienId: technicienId,
        dateDebut: debut.toISOString(),
        dateFin: fin.toISOString(),
        motif: motif.trim() || null,
      });
      handleClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      const msg = axiosErr?.response?.data?.message;
      setFormError(
        typeof msg === 'string' ? msg : Array.isArray(msg) ? msg[0] : 'Une erreur est survenue.',
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle className={styles.title}>Nouvelle indisponibilité</DialogTitle>
        </DialogHeader>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="idp-date-debut">
              Date de début
            </label>
            <input
              id="idp-date-debut"
              type="datetime-local"
              className={styles.input}
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="idp-date-fin">
              Date de fin
            </label>
            <input
              id="idp-date-fin"
              type="datetime-local"
              className={styles.input}
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="idp-motif">
              Motif <span className={styles.optional}>(facultatif)</span>
            </label>
            <input
              id="idp-motif"
              type="text"
              className={styles.input}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex : Congés, formation…"
            />
          </div>

          {formError && <p className={styles.error}>{formError}</p>}

          <div className={styles.actions}>
            <button className={styles.cancelButton} onClick={handleClose}>
              Annuler
            </button>
            <button className={styles.submitButton} onClick={handleSubmit}>
              Créer
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}