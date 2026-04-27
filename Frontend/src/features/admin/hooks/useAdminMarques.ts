import { useCallback, useEffect, useState } from 'react';
import { adminMarquesService } from '../services/adminMarquesService';
import type { CycleItemPayload, Marque } from '../types/cycles.types';

export function useAdminMarques() {
  const [items, setItems] = useState<Marque[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminMarquesService.getAll();
      setItems(result);
    } catch {
      setError('Impossible de charger les marques.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const createItem = async (payload: CycleItemPayload) => {
    await adminMarquesService.create(payload);
    await fetchItems();
  };

  const updateItem = async (id: string, payload: CycleItemPayload) => {
    await adminMarquesService.update(id, payload);
    await fetchItems();
  };

  const deleteItem = async (id: string) => {
    await adminMarquesService.delete(id);
    await fetchItems();
  };

  return { items, isLoading, error, createItem, updateItem, deleteItem };
}
