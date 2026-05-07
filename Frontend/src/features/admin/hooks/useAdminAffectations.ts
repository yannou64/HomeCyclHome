import { useCallback, useEffect, useState } from 'react';
import { adminAffectationsService } from '../services/adminAffectationsService';
import type { Affectation, SetTechnicienZonesPayload } from '../types/affectations.types';

export function useAdminAffectations() {
  const [items, setItems] = useState<Affectation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminAffectationsService.getAll();
      setItems(result);
    } catch {
      setError('Impossible de charger les affectations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const setZones = async (technicienId: string, payload: SetTechnicienZonesPayload) => {
    await adminAffectationsService.setZones(technicienId, payload);
    await fetchItems();
  };

  const deleteAffectation = async (technicienId: string) => {
    await adminAffectationsService.delete(technicienId);
    await fetchItems();
  };

  return { items, isLoading, error, setZones, deleteAffectation };
}