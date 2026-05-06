import { useCallback, useEffect, useState } from 'react';
import { adminZonesService } from '../services/adminZonesService';
import type { Zone, CreateZonePayload, UpdateZonePayload } from '../types/zones.types';

export function useAdminZones() {
  const [items, setItems] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminZonesService.getAll();
      setItems(result);
    } catch {
      setError('Impossible de charger les zones.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const createZone = async (payload: CreateZonePayload) => {
    await adminZonesService.create(payload);
    await fetchItems();
  };

  const updateZone = async (id: string, payload: UpdateZonePayload) => {
    await adminZonesService.update(id, payload);
    await fetchItems();
  };

  const deleteZone = async (id: string) => {
    await adminZonesService.delete(id);
    await fetchItems();
  };

  return { items, isLoading, error, createZone, updateZone, deleteZone };
}