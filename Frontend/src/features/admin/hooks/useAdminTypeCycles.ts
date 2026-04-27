import { useCallback, useEffect, useState } from 'react';
import { adminTypeCyclesService } from '../services/adminTypeCyclesService';
import type { CycleItemPayload, TypeCycle } from '../types/cycles.types';

export function useAdminTypeCycles() {
  const [items, setItems] = useState<TypeCycle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminTypeCyclesService.getAll();
      setItems(result);
    } catch {
      setError('Impossible de charger les types de cycles.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const createItem = async (payload: CycleItemPayload) => {
    await adminTypeCyclesService.create(payload);
    await fetchItems();
  };

  const updateItem = async (id: string, payload: CycleItemPayload) => {
    await adminTypeCyclesService.update(id, payload);
    await fetchItems();
  };

  const deleteItem = async (id: string) => {
    await adminTypeCyclesService.delete(id);
    await fetchItems();
  };

  return { items, isLoading, error, createItem, updateItem, deleteItem };
}
