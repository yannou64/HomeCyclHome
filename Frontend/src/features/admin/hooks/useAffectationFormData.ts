import { useEffect, useState } from 'react';
import { adminAffectationsService } from '../services/adminAffectationsService';
import type { AdminUser } from '../types/admin.types';
import type { ZoneAffectee } from '../types/affectations.types';

// Données du formulaire (techniciens + zones) — chargées uniquement quand le dialog s'ouvre
export function useAffectationFormData(isOpen: boolean) {
  const [techniciens, setTechniciens] = useState<AdminUser[]>([]);
  const [zones, setZones] = useState<ZoneAffectee[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    void (async () => {
      setIsLoadingData(true);
      setLoadError(null);
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
        setLoadError('Impossible de charger les données du formulaire.');
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen]);

  return { techniciens, zones, isLoadingData, loadError };
}
