import { useEffect, useState } from 'react';
import { adminPlanningService } from '../services/adminPlanningService';
import type { ZoneAffectee } from '../types/affectations.types';

// Zones affectées à un technicien — chargées uniquement quand le dialog s'ouvre
export function useZonesForTechnicien(technicienId: string, isOpen: boolean) {
  const [zones, setZones] = useState<ZoneAffectee[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    void (async () => {
      setIsLoadingZones(true);
      setLoadError(null);
      try {
        const data = await adminPlanningService.getZonesForTechnicien(technicienId);
        if (!cancelled) setZones(data);
      } catch {
        if (!cancelled) setLoadError('Impossible de charger les zones du technicien.');
      } finally {
        if (!cancelled) setIsLoadingZones(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen, technicienId]);

  return { zones, isLoadingZones, loadError };
}
