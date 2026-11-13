import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminAffectationsService } from '../services/adminAffectationsService';
import type { Affectation, SetTechnicienZonesPayload } from '../types/affectations.types';

// Loader défini hors du composant : référence stable, la liste n'est
// chargée qu'au montage puis à chaque reload().
const loadAffectations = () => adminAffectationsService.getAll();

export function useAdminAffectations() {
  const {
    data: items,
    isLoading,
    error,
    reload,
  } = useAsyncData<Affectation[]>(loadAffectations, [], 'Impossible de charger les affectations.');

  const setZones = async (technicienId: string, payload: SetTechnicienZonesPayload) => {
    await adminAffectationsService.setZones(technicienId, payload);
    reload();
  };

  const deleteAffectation = async (technicienId: string) => {
    await adminAffectationsService.delete(technicienId);
    reload();
  };

  return { items, isLoading, error, setZones, deleteAffectation };
}