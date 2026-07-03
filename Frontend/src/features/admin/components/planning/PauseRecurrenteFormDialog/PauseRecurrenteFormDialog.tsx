import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import { timeToMinutes } from '../../../../../shared/utils/timeUtils';
import type { CreatePauseRecurrentePayload } from '../../../types/planning.types';
import styles from './PauseRecurrenteFormDialog.module.scss';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

interface PauseRecurrenteFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreatePauseRecurrentePayload) => Promise<void>;
  technicienId: string;
}

export function PauseRecurrenteFormDialog({
  isOpen,
  onClose,
  onSubmit,
  technicienId,
}: PauseRecurrenteFormDialogProps) {
  const [jourSemaine, setJourSemaine] = useState<string>('');
  const [heureDebut, setHeureDebut] = useState('');
  const [heureFin, setHeureFin] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Réinitialise l'état et ferme — utilisé par tous les chemins de fermeture
  const handleClose = () => {
    setJourSemaine('');
    setHeureDebut('');
    setHeureFin('');
    setDescription('');
    setFormError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!heureDebut || !heureFin) {
      setFormError("Les heures de début et de fin sont obligatoires.");
      return;
    }

    const debut = timeToMinutes(heureDebut);
    const fin = timeToMinutes(heureFin);

    if (fin <= debut) {
      setFormError("L'heure de fin doit être postérieure à l'heure de début.");
      return;
    }

    setFormError(null);
    try {
      await onSubmit({
        technicienId: technicienId,
        jourSemaine: jourSemaine !== '' ? parseInt(jourSemaine, 10) : null,
        heureDebut: debut,
        heureFin: fin,
        description: description.trim() || null,
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
          <DialogTitle className={styles.title}>Nouvelle pause récurrente</DialogTitle>
        </DialogHeader>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="pause-jour">
              Jour <span className={styles.optional}>(tous les jours si vide)</span>
            </label>
            <select
              id="pause-jour"
              className={styles.select}
              value={jourSemaine}
              onChange={(e) => setJourSemaine(e.target.value)}
            >
              <option value="">— Tous les jours —</option>
              {JOURS.map((jour, index) => (
                <option key={index} value={index}>
                  {jour}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="pause-debut">
                Heure de début
              </label>
              <input
                id="pause-debut"
                type="time"
                className={styles.input}
                value={heureDebut}
                onChange={(e) => setHeureDebut(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="pause-fin">
                Heure de fin
              </label>
              <input
                id="pause-fin"
                type="time"
                className={styles.input}
                value={heureFin}
                onChange={(e) => setHeureFin(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="pause-desc">
              Description <span className={styles.optional}>(facultatif)</span>
            </label>
            <input
              id="pause-desc"
              type="text"
              className={styles.input}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex : Pause déjeuner"
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