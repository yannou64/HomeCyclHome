import { useCallback, useEffect, useState } from 'react';
import { adminForfaitsService } from '../services/adminForfaitsService';
import type { Forfait, ForfaitPayload } from '../types/forfaits.types';

export function useAdminForfaits() {
  const [items, setItems] = useState<Forfait[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminForfaitsService.getAll();
      setItems(result);
    } catch {
      setError('Impossible de charger les forfaits.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const createItem = async (payload: ForfaitPayload) => {
    await adminForfaitsService.create(payload);
    await fetchItems();
  };

  const updateItem = async (id: string, payload: ForfaitPayload) => {
    await adminForfaitsService.update(id, payload);
    await fetchItems();
  };

  const deleteItem = async (id: string) => {
    await adminForfaitsService.delete(id);
    await fetchItems();
  };

  const setPrix = async (id: string, payload: { montant: number; dateDebut: string }) => {
    await adminForfaitsService.setPrix(id, payload);
    await fetchItems();
  };

  return { items, isLoading, error, createItem, updateItem, deleteItem, setPrix };
}