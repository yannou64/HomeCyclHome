import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminTypeCyclesService } from '../services/adminTypeCyclesService';
import type { CycleItemPayload, TypeCycle } from '../types/cycles.types';

// Loader défini hors du composant : référence stable, la liste n'est
// chargée qu'au montage puis à chaque reload().
const loadTypeCycles = () => adminTypeCyclesService.getAll();

export function useAdminTypeCycles() {
  const {
    data: items,
    isLoading,
    error,
    reload,
  } = useAsyncData<TypeCycle[]>(loadTypeCycles, [], 'Impossible de charger les types de cycles.');

  const createItem = async (payload: CycleItemPayload) => {
    await adminTypeCyclesService.create(payload);
    reload();
  };

  const updateItem = async (id: string, payload: CycleItemPayload) => {
    await adminTypeCyclesService.update(id, payload);
    reload();
  };

  const deleteItem = async (id: string) => {
    await adminTypeCyclesService.delete(id);
    reload();
  };

  return { items, isLoading, error, createItem, updateItem, deleteItem };
}
