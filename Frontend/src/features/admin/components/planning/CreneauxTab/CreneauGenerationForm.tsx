import { useState } from 'react';
import type { GenerateCreneauxPayload, GenerationRapport, ModelePlanification } from '../../../types/planning.types';
import styles from './CreneauGenerationForm.module.scss';

interface CreneauGenerationFormProps {
  modeles: ModelePlanification[];
  onGenerate: (payload: GenerateCreneauxPayload) => Promise<GenerationRapport>;
  onGenerateAll: (dateFinGeneration?: string) => Promise<GenerationRapport>;
  onRapport: (rapport: GenerationRapport) => void;
}

export function CreneauGenerationForm({ modeles, onGenerate, onGenerateAll, onRapport }: CreneauGenerationFormProps) {
  const [modeleId, setModeleId] = useState('');
  const [dateFinGeneration, setDateFinGeneration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!modeleId) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const payload: GenerateCreneauxPayload = {
        modeleId: modeleId,
        ...(dateFinGeneration ? { dateFinGeneration: dateFinGeneration } : {}),
      };
      const rapport = await onGenerate(payload);
      onRapport(rapport);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erreur lors de la génération des créneaux.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateAll = async () => {
    setIsSubmittingAll(true);
    setError(null);
    try {
      const rapport = await onGenerateAll(dateFinGeneration || undefined);
      onRapport(rapport);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erreur lors de la génération des créneaux.';
      setError(message);
    } finally {
      setIsSubmittingAll(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.formTitle}>Générer des créneaux</h3>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="gen-modele">
            Modèle de planification
          </label>
          <select
            id="gen-modele"
            className={styles.select}
            value={modeleId}
            onChange={(e) => setModeleId(e.target.value)}
            required
          >
            <option value="">— Choisir un modèle —</option>
            {modeles.map((m) => (
              <option key={m.id} value={m.id}>
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][m.jourSemaine]} —{' '}
                {String(Math.floor(m.heureDebut / 60)).padStart(2, '0')}:
                {String(m.heureDebut % 60).padStart(2, '0')} →{' '}
                {String(Math.floor(m.heureFin / 60)).padStart(2, '0')}:
                {String(m.heureFin % 60).padStart(2, '0')}{' '}
                (/{m.intervalleMinutes}min)
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="gen-date-fin">
            Générer jusqu'au <span className={styles.optional}>(optionnel — exclusif)</span>
          </label>
          <input
            id="gen-date-fin"
            type="date"
            className={styles.input}
            value={dateFinGeneration}
            onChange={(e) => setDateFinGeneration(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={!modeleId || isSubmitting || isSubmittingAll}
        >
          {isSubmitting ? 'Génération…' : 'Générer'}
        </button>

        <button
          type="button"
          className={styles.submitButtonAll}
          disabled={modeles.length === 0 || isSubmitting || isSubmittingAll}
          onClick={handleGenerateAll}
        >
          {isSubmittingAll ? 'Génération…' : 'Tout générer'}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}