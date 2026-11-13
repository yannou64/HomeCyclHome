import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminForfaitsService } from '../services/adminForfaitsService';
import type { Forfait, ForfaitPayload } from '../types/forfaits.types';

// Loader défini hors du composant : sa référence ne change jamais, donc la
// liste n'est chargée qu'au montage puis à chaque reload().
const loadForfaits = () => adminForfaitsService.getAll();

export function useAdminForfaits() {
  const {
    data: items,
    isLoading,
    error,
    reload,
  } = useAsyncData<Forfait[]>(loadForfaits, [], 'Impossible de charger les forfaits.');

  // Chaque modification recharge la liste une fois la requête terminée.
  const createItem = async (payload: ForfaitPayload) => {
    await adminForfaitsService.create(payload);
    reload();
  };

  const updateItem = async (id: string, payload: ForfaitPayload) => {
    await adminForfaitsService.update(id, payload);
    reload();
  };

  const deleteItem = async (id: string) => {
    await adminForfaitsService.delete(id);
    reload();
  };

  const setPrix = async (id: string, payload: { montant: number; dateDebut: string }) => {
    await adminForfaitsService.setPrix(id, payload);
    reload();
  };

  return { items, isLoading, error, createItem, updateItem, deleteItem, setPrix };
}
