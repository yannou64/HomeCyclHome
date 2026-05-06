import { useCallback, useState } from 'react';
import type { Zone, ZonePoint, CreateZonePayload, UpdateZonePayload } from '../../../types/zones.types';
import { ZoneMapDrawer } from '../ZoneMapDrawer/ZoneMapDrawer';
import styles from './ZoneForm.module.scss';

interface ZoneFormProps {
  zone?: Zone;
  onSubmit: (payload: CreateZonePayload | UpdateZonePayload) => Promise<void>;
  onCancel: () => void;
}

export function ZoneForm({ zone, onSubmit, onCancel }: ZoneFormProps) {
  const [nomZone, setNomZone] = useState(zone?.nom_zone ?? '');
  const [points, setPoints] = useState<ZonePoint[]>(zone?.points ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useCallback évite de recréer la fonction à chaque render et de provoquer
  // un redraw inutile du polygone dans ZoneMapDrawer
  const handlePointsChange = useCallback((newPoints: ZonePoint[]) => {
    setPoints(newPoints);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nomZone.trim()) {
      setError('Le nom de la zone est obligatoire.');
      return;
    }
    if (points.length < 3) {
      setError('Le polygone doit contenir au minimum 3 sommets.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ nom_zone: nomZone.trim(), points });
      onCancel(); // retour à la liste après succès
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {zone ? 'Modifier la zone' : 'Nouvelle zone'}
        </h2>
        <button type="button" className={styles.cancelLink} onClick={onCancel}>
          ← Retour à la liste
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="nom_zone" className={styles.label}>
            Nom de la zone
          </label>
          <input
            id="nom_zone"
            type="text"
            className={styles.input}
            value={nomZone}
            onChange={(e) => setNomZone(e.target.value)}
            placeholder="Ex : Lyon Centre"
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.field}>
          <p className={styles.label}>Délimitation géographique</p>
          <ZoneMapDrawer
            initialPoints={zone?.points}
            onChange={handlePointsChange}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || points.length < 3}
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer la zone'}
          </button>
        </div>
      </form>
    </div>
  );
}
