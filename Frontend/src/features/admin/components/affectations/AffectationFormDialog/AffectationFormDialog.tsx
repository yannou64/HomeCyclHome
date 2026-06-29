import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import { adminAffectationsService } from '../../../services/adminAffectationsService';
import type { AdminUser } from '../../../types/admin.types';
import type { Affectation, ZoneAffectee } from '../../../types/affectations.types';
import styles from './AffectationFormDialog.module.scss';

interface AffectationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (technicienId: string, zoneIds: string[]) => Promise<void>;
  // Présent en mode édition, null en mode création
  item?: Affectation;
}

export function AffectationFormDialog({
  isOpen,
  onClose,
  onSubmit,
  item,
}: AffectationFormDialogProps) {
  const isEditMode = !!item;

  const [techniciens, setTechniciens] = useState<AdminUser[]>([]);
  const [zones, setZones] = useState<ZoneAffectee[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [selectedTechnicienId, setSelectedTechnicienId] = useState('');
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Chargement paresseux : uniquement quand le dialog s'ouvre
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const loadData = async () => {
      setIsLoadingData(true);
      setFormError(null);
      try {
        const [techs, zns] = await Promise.all([
          adminAffectationsService.getTechniciens(),
          adminAffectationsService.getZones(),
        ]);
        if (cancelled) return;
        setTechniciens(techs);
        setZones(zns);
      } catch {
        if (cancelled) return;
        setFormError('Impossible de charger les données du formulaire.');
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    };

    void loadData();

    // Pré-remplissage en mode édition
    if (isEditMode) {
      setSelectedTechnicienId(item.technicienId);
      setSelectedZoneIds(item.zones.map((z) => z.id));
    } else {
      setSelectedTechnicienId('');
      setSelectedZoneIds([]);
    }

    return () => { cancelled = true; };
  }, [isOpen, isEditMode, item]);

  const toggleZone = (zoneId: string) => {
    setSelectedZoneIds((prev) =>
      prev.includes(zoneId) ? prev.filter((id) => id !== zoneId) : [...prev, zoneId],
    );
  };

  const handleSubmit = async () => {
    if (!selectedTechnicienId) {
      setFormError('Veuillez sélectionner un technicien.');
      return;
    }
    if (selectedZoneIds.length === 0) {
      setFormError('Veuillez sélectionner au moins une zone.');
      return;
    }

    await onSubmit(selectedTechnicienId, selectedZoneIds);
    onClose();
  };

  const technicienLabel = isEditMode
    ? `${item.prenom} ${item.nom}`
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle className={styles.title}>
            {isEditMode ? 'Modifier les zones' : 'Nouvelle affectation'}
          </DialogTitle>
        </DialogHeader>

        {isLoadingData ? (
          <p className={styles.loading}>Chargement...</p>
        ) : (
          <div className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Technicien</label>
              {isEditMode ? (
                <p className={styles.technicienFixed}>{technicienLabel}</p>
              ) : (
                <select
                  className={styles.select}
                  value={selectedTechnicienId}
                  onChange={(e) => setSelectedTechnicienId(e.target.value)}
                >
                  <option value="">— Sélectionner un technicien —</option>
                  {techniciens.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.prenom} {t.nom}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Zones affectées</label>
              <div className={styles.zonesList}>
                {zones.length === 0 ? (
                  <p className={styles.noZones}>Aucune zone disponible.</p>
                ) : (
                  zones.map((zone) => (
                    <label key={zone.id} className={styles.zoneItem}>
                      <input
                        type="checkbox"
                        checked={selectedZoneIds.includes(zone.id)}
                        onChange={() => toggleZone(zone.id)}
                        className={styles.checkbox}
                      />
                      <span>{zone.nomZone}</span>
                      {!zone.isActive && (
                        <span className={styles.inactiveTag}>inactif</span>
                      )}
                    </label>
                  ))
                )}
              </div>
            </div>

            {formError && <p className={styles.error}>{formError}</p>}

            <div className={styles.actions}>
              <button className={styles.cancelButton} onClick={onClose}>
                Annuler
              </button>
              <button className={styles.submitButton} onClick={handleSubmit}>
                {isEditMode ? 'Enregistrer' : 'Affecter'}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}