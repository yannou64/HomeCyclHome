import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminMarquesService } from '../services/adminMarquesService';
import type { CycleItemPayload, Marque } from '../types/cycles.types';

// Loader défini hors du composant : référence stable, la liste n'est
// chargée qu'au montage puis à chaque reload().
const loadMarques = () => adminMarquesService.getAll();

export function useAdminMarques() {
  const {
    data: items,
    isLoading,
    error,
    reload,
  } = useAsyncData<Marque[]>(loadMarques, [], 'Impossible de charger les marques.');

  const createItem = async (payload: CycleItemPayload) => {
    await adminMarquesService.create(payload);
    reload();
  };

  const updateItem = async (id: string, payload: CycleItemPayload) => {
    await adminMarquesService.update(id, payload);
    reload();
  };

  const deleteItem = async (id: string) => {
    await adminMarquesService.delete(id);
    reload();
  };

  return { items, isLoading, error, createItem, updateItem, deleteItem };
}
