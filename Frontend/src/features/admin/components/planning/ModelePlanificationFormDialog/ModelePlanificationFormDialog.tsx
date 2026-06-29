import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import { adminPlanningService } from '../../../services/adminPlanningService';
import type { ZoneAffectee } from '../../../types/affectations.types';
import type {
  CreateModelePlanificationPayload,
  ModelePlanification,
  UpdateModelePlanificationPayload,
} from '../../../types/planning.types';
import { timeToMinutes, minutesToTime } from '../../../../../shared/utils/timeUtils';
import styles from './ModelePlanificationFormDialog.module.scss';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

interface ModelePlanificationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    payload: CreateModelePlanificationPayload | UpdateModelePlanificationPayload,
  ) => Promise<void>;
  technicienId: string;
  item?: ModelePlanification;
}

export function ModelePlanificationFormDialog({
  isOpen,
  onClose,
  onSubmit,
  technicienId,
  item,
}: ModelePlanificationFormDialogProps) {
  const isEditMode = !!item;

  const [zones, setZones] = useState<ZoneAffectee[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(false);

  const [zoneId, setZoneId] = useState('');
  const [jourSemaine, setJourSemaine] = useState('0');
  const [heureDebut, setHeureDebut] = useState('');
  const [heureFin, setHeureFin] = useState('');
  const [intervalleMinutes, setIntervalleMinutes] = useState('60');
  const [isActif, setIsActif] = useState(true);
  const [dateDebutValidite, setDateDebutValidite] = useState('');
  const [dateFinValidite, setDateFinValidite] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  // Chargement paresseux des zones + pré-remplissage en mode édition
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const load = async () => {
      setIsLoadingZones(true);
      setFormError(null);

      if (isEditMode && item) {
        setZoneId(item.zoneId);
        setJourSemaine(String(item.jourSemaine));
        setHeureDebut(minutesToTime(item.heureDebut));
        setHeureFin(minutesToTime(item.heureFin));
        setIntervalleMinutes(String(item.intervalleMinutes));
        setIsActif(item.isActif);
        setDateDebutValidite(item.dateDebutValidite.slice(0, 10));
        setDateFinValidite(item.dateFinValidite ? item.dateFinValidite.slice(0, 10) : '');
      } else {
        setZoneId('');
        setJourSemaine('0');
        setHeureDebut('');
        setHeureFin('');
        setIntervalleMinutes('60');
        setIsActif(true);
        setDateDebutValidite('');
        setDateFinValidite('');
      }

      try {
        const data = await adminPlanningService.getZonesForTechnicien(technicienId);
        if (!cancelled) setZones(data);
      } catch {
        if (!cancelled) setFormError('Impossible de charger les zones du technicien.');
      } finally {
        if (!cancelled) setIsLoadingZones(false);
      }
    };

    void load();

    return () => { cancelled = true; };
  }, [isOpen, isEditMode, item, technicienId]);

  const handleSubmit = async () => {
    if (!zoneId) { setFormError('Veuillez sélectionner une zone.'); return; }
    if (!heureDebut || !heureFin) { setFormError("Les heures sont obligatoires."); return; }
    if (!dateDebutValidite) { setFormError("La date de début de validité est obligatoire."); return; }

    const debut = timeToMinutes(heureDebut);
    const fin = timeToMinutes(heureFin);

    if (fin <= debut) {
      setFormError("L'heure de fin doit être postérieure à l'heure de début.");
      return;
    }

    const intervalle = parseInt(intervalleMinutes, 10);
    if (isNaN(intervalle) || intervalle <= 0) {
      setFormError("L'intervalle doit être un nombre positif.");
      return;
    }

    setFormError(null);

    const payload: CreateModelePlanificationPayload = {
      technicienId: technicienId,
      zoneId: zoneId,
      jourSemaine: parseInt(jourSemaine, 10),
      heureDebut: debut,
      heureFin: fin,
      intervalleMinutes: intervalle,
      isActif: isActif,
      dateDebutValidite: new Date(dateDebutValidite).toISOString(),
      dateFinValidite: dateFinValidite ? new Date(dateFinValidite).toISOString() : null,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      const msg = axiosErr?.response?.data?.message;
      setFormError(
        typeof msg === 'string'
          ? msg
          : Array.isArray(msg)
            ? msg[0]
            : 'Une erreur est survenue lors de la création du modèle.',
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle className={styles.title}>
            {isEditMode ? 'Modifier le modèle' : 'Nouveau modèle de planification'}
          </DialogTitle>
        </DialogHeader>

        {isLoadingZones ? (
          <p className={styles.loading}>Chargement des zones...</p>
        ) : (
          <div className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="modele-zone">
                Zone
              </label>
              <select
                id="modele-zone"
                className={styles.select}
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
              >
                <option value="">— Sélectionner une zone —</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.nomZone}{!z.isActive ? ' (inactive)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="modele-jour">
                Jour de la semaine
              </label>
              <select
                id="modele-jour"
                className={styles.select}
                value={jourSemaine}
                onChange={(e) => setJourSemaine(e.target.value)}
              >
                {JOURS.map((jour, index) => (
                  <option key={index} value={index}>
                    {jour}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="modele-debut">
                  Heure de début
                </label>
                <input
                  id="modele-debut"
                  type="time"
                  className={styles.input}
                  value={heureDebut}
                  onChange={(e) => setHeureDebut(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="modele-fin">
                  Heure de fin
                </label>
                <input
                  id="modele-fin"
                  type="time"
                  className={styles.input}
                  value={heureFin}
                  onChange={(e) => setHeureFin(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="modele-intervalle">
                Intervalle entre créneaux (minutes)
              </label>
              <input
                id="modele-intervalle"
                type="number"
                min={15}
                step={15}
                className={styles.input}
                value={intervalleMinutes}
                onChange={(e) => setIntervalleMinutes(e.target.value)}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="modele-validite-debut">
                  Valide à partir du
                </label>
                <input
                  id="modele-validite-debut"
                  type="date"
                  className={styles.input}
                  value={dateDebutValidite}
                  onChange={(e) => setDateDebutValidite(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="modele-validite-fin">
                  Jusqu'au <span className={styles.optional}>(facultatif)</span>
                </label>
                <input
                  id="modele-validite-fin"
                  type="date"
                  className={styles.input}
                  value={dateFinValidite}
                  onChange={(e) => setDateFinValidite(e.target.value)}
                />
              </div>
            </div>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={isActif}
                onChange={(e) => setIsActif(e.target.checked)}
              />
              Modèle actif
            </label>

            {formError && <p className={styles.error}>{formError}</p>}

            <div className={styles.actions}>
              <button className={styles.cancelButton} onClick={onClose}>
                Annuler
              </button>
              <button className={styles.submitButton} onClick={handleSubmit}>
                {isEditMode ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
